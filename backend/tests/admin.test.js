const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');
const { loginAgent } = require('./helpers/auth');

describe('Admin Module Integration Tests', () => {
  let adminAgent;
  let studentAgent;
  let adminUser;
  let targetStudentUser;

  const adminEmail = `admin_test_${Date.now()}@elearning.com`;
  const studentEmail = `student_test_${Date.now()}@elearning.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        fullName: 'Admin Tester',
        role: 'ADMIN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    targetStudentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        password: hashedPassword,
        fullName: 'Student Target',
        role: 'STUDENT',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const adminLogin = await loginAgent(adminEmail, password);
    adminAgent = adminLogin.agent;

    const studentLogin = await loginAgent(studentEmail, password);
    studentAgent = studentLogin.agent;
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
    const res = await studentAgent.get('/api/v1/admin/stats');
    expect(res.statusCode).toBe(403);
  });

  it('GET /api/v1/admin/stats - Trả về thống kê tổng quan cho ADMIN', async () => {
    const res = await adminAgent.get('/api/v1/admin/stats');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalTeachers');
    expect(res.body.data).toHaveProperty('totalWorkspaces');
    expect(res.body.data).toHaveProperty('totalSubmissions');
  });

  it('GET /api/v1/admin/users - Lấy danh sách người dùng', async () => {
    const res = await adminAgent.get('/api/v1/admin/users');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/v1/admin/users/:id/role - Cập nhật vai trò người dùng', async () => {
    const res = await adminAgent
      .put(`/api/v1/admin/users/${targetStudentUser.id}/role`)
      .send({ role: 'TEACHER' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('TEACHER');
  });

  it('PUT /api/v1/admin/users/:id/toggle-status - Khóa / mở khóa tài khoản', async () => {
    const res = await adminAgent.put(`/api/v1/admin/users/${targetStudentUser.id}/toggle-status`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });

  it('GET /api/v1/admin/teachers - Lấy danh sách giảng viên', async () => {
    const res = await adminAgent.get('/api/v1/admin/teachers');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/v1/admin/teachers/:id/plan - Cập nhật gói dịch vụ giảng viên', async () => {
    const res = await adminAgent
      .put(`/api/v1/admin/teachers/${targetStudentUser.id}/plan`)
      .send({ plan: 'PRO' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan).toBe('PRO');
  });

  it('GET /api/v1/admin/revenue - Trả về báo cáo doanh thu', async () => {
    const res = await adminAgent.get('/api/v1/admin/revenue');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('estimatedMRR');
  });
});
