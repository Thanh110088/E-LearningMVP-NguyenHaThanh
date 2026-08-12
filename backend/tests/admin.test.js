const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

describe('Admin Module Integration Tests', () => {
  let adminToken;
  let studentToken;
  let adminUser;
  let targetStudentUser;

  const adminEmail = `admin_test_${Date.now()}@elearning.com`;
  const studentEmail = `student_test_${Date.now()}@elearning.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin User
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        fullName: 'Admin Tester',
        role: 'ADMIN',
      },
    });

    // Create Student User
    targetStudentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        password: hashedPassword,
        fullName: 'Student Target',
        role: 'STUDENT',
      },
    });

    // Login Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password });

    adminToken = adminLogin.body.data?.accessToken;

    // Login Student
    const studentLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: studentEmail, password });

    studentToken = studentLogin.body.data?.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.auditLog.deleteMany({
      where: {
        userId: { in: [adminUser.id, targetStudentUser.id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminUser.id, targetStudentUser.id] },
      },
    });
    await prisma.$disconnect();
  });

  it('GET /api/v1/admin/stats - Từ chối khi không có token (401)', async () => {
    const res = await request(app).get('/api/v1/admin/stats');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/v1/admin/stats - Từ chối khi người dùng không phải ADMIN (403)', async () => {
    if (!studentToken) return;
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('GET /api/v1/admin/stats - Trả về thống kê tổng quan cho ADMIN', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalTeachers');
    expect(res.body.data).toHaveProperty('totalWorkspaces');
    expect(res.body.data).toHaveProperty('totalSubmissions');
  });

  it('GET /api/v1/admin/users - Lấy danh sách người dùng', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/v1/admin/users/:id/role - Cập nhật vai trò người dùng', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .put(`/api/v1/admin/users/${targetStudentUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'TEACHER' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('TEACHER');
  });

  it('PUT /api/v1/admin/users/:id/toggle-status - Khóa / mở khóa tài khoản', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .put(`/api/v1/admin/users/${targetStudentUser.id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });

  it('GET /api/v1/admin/teachers - Lấy danh sách giảng viên', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/admin/teachers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/v1/admin/teachers/:id/plan - Cập nhật gói dịch vụ giảng viên', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .put(`/api/v1/admin/teachers/${targetStudentUser.id}/plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ plan: 'PRO' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan).toBe('PRO');
  });

  it('GET /api/v1/admin/revenue - Trả về báo cáo doanh thu', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/admin/revenue')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('estimatedMRR');
  });
});
