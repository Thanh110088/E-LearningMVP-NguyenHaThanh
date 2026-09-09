const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const mailService = require('../src/services/mail.service');
const { extractTokenFromMail, registerAndActivate, loginAgent } = require('./helpers/auth');

describe('Auth Module Integration Tests', () => {
  const stamp = Date.now();
  const testUser = {
    email: `testuser_${stamp}@elearning.com`,
    password: 'TestPassword123',
    fullName: 'Test Student User',
  };

  const googleEmail = `google_${stamp}@elearning.com`;

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { in: [testUser.email, googleEmail] } } },
    });
    await prisma.emailToken.deleteMany({
      where: { user: { email: { in: [testUser.email, googleEmail] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, googleEmail] } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/v1/auth/register - Từ chối body không hợp lệ (Zod)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: '1', fullName: 'A' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('POST /api/v1/auth/register - Đăng ký thành công và gửi email xác nhận', async () => {
    mailService.clearOutbox();
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requiresEmailVerification).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.emailVerified).toBe(false);
    expect(res.headers['set-cookie']).toBeUndefined();

    const mail = mailService.findByTo(testUser.email);
    expect(mail).toBeTruthy();
    expect(mail.subject).toMatch(/xác nhận email/i);
    expect(extractTokenFromMail(mail)).toHaveLength(64);
  });

  it('POST /api/v1/auth/login - Chặn đăng nhập khi chưa xác nhận email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('POST /api/v1/auth/verify-email - Xác nhận email, set cookie và cho phép /me', async () => {
    const mail = mailService.findByTo(testUser.email);
    const token = extractTokenFromMail(mail);
    const agent = request.agent(app);

    const verifyRes = await agent.post('/api/v1/auth/verify-email').send({ token });
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.data.user.emailVerified).toBe(true);
    expect(verifyRes.headers['set-cookie']?.join(';')).toMatch(/accessToken=/);
    expect(verifyRes.headers['set-cookie']?.join(';')).toMatch(/refreshToken=/);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/register - Từ chối email trùng', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/v1/auth/login - Đăng nhập password, cookie httpOnly', async () => {
    const { agent, res } = await loginAgent(testUser.email, testUser.password);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeUndefined();
    expect(res.headers['set-cookie']?.join(';')).toMatch(/HttpOnly/i);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/login - Sai mật khẩu', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPass123' });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/v1/auth/refresh-token - Xoay refresh token từ cookie', async () => {
    const { agent } = await loginAgent(testUser.email, testUser.password);
    const res = await agent.post('/api/v1/auth/refresh-token').send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']?.join(';')).toMatch(/accessToken=/);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(200);
  });

  it('POST /api/v1/auth/forgot-password + reset-password - Đặt lại mật khẩu qua email', async () => {
    mailService.clearOutbox();
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testUser.email });

    expect(forgotRes.statusCode).toBe(200);

    const mail = mailService.findLatestByToAndSubject(testUser.email, 'Đặt lại mật khẩu');
    expect(mail).toBeTruthy();
    const token = extractTokenFromMail(mail);
    const newPassword = 'NewPassword456';

    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token, newPassword });

    expect(resetRes.statusCode).toBe(200);

    const changedMail = mailService.findLatestByToAndSubject(testUser.email, 'vừa được thay đổi');
    expect(changedMail).toBeTruthy();

    const oldLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(oldLogin.statusCode).toBe(401);

    testUser.password = newPassword;
    const { agent, res } = await loginAgent(testUser.email, newPassword);
    expect(res.statusCode).toBe(200);
    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(200);
  });

  it('POST /api/v1/auth/change-password - Đổi mật khẩu khi đã đăng nhập và gửi email cảnh báo', async () => {
    const { agent } = await loginAgent(testUser.email, testUser.password);
    mailService.clearOutbox();
    const nextPassword = 'ChangedPass789';

    const res = await agent.post('/api/v1/auth/change-password').send({
      currentPassword: testUser.password,
      newPassword: nextPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(mailService.findLatestByToAndSubject(testUser.email, 'vừa được thay đổi')).toBeTruthy();

    testUser.password = nextPassword;
    const { res: loginRes } = await loginAgent(testUser.email, nextPassword);
    expect(loginRes.statusCode).toBe(200);
  });

  it('POST /api/v1/auth/google - Đăng nhập Google (mock token khi NODE_ENV=test)', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/api/v1/auth/google').send({
      idToken: `mock-google:${googleEmail}:Google User:sub-${stamp}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(googleEmail);
    expect(res.body.data.user.emailVerified).toBe(true);
    expect(res.body.data.user.provider).toBe('GOOGLE');

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.email).toBe(googleEmail);
  });

  it('POST /api/v1/auth/logout - Xóa cookie và không còn truy cập /me', async () => {
    const { agent } = await loginAgent(testUser.email, testUser.password);
    const logoutRes = await agent.post('/api/v1/auth/logout');
    expect(logoutRes.statusCode).toBe(200);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(401);
  });

  it('GET /api/v1/unknown-route - 404 tập trung', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('registerAndActivate helper - luồng đăng ký đầy đủ', async () => {
    const email = `helper_${stamp}@elearning.com`;
    const { agent, verifyRes } = await registerAndActivate({
      email,
      password: 'HelperPass123',
      fullName: 'Helper User',
    });
    expect(verifyRes.statusCode).toBe(200);
    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.statusCode).toBe(200);
    await prisma.emailToken.deleteMany({ where: { user: { email } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.delete({ where: { email } });
  });
});
