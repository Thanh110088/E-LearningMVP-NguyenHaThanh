const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Sprint 3 & Sprint 4 Integration Tests', () => {
  let adminToken = '';

  beforeAll(async () => {
    // Login as Admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@elearning.com',
        password: 'Admin123456',
      });

    if (loginRes.statusCode === 200) {
      adminToken = loginRes.body.data.accessToken;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/v1/dashboard/stats - Lấy số liệu thống kê Dashboard', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/v1/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalExams');
    expect(res.body.data).toHaveProperty('totalSubmissions');
  });

  it('GET /api/v1/leaderboard - Lấy bảng xếp hạng điểm cao', async () => {
    const res = await request(app)
      .get('/api/v1/leaderboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/reports - Lấy dữ liệu báo cáo các lượt làm bài', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/reports/export - Xuất file CSV báo cáo lượt thi', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/v1/reports/export')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
  });

  it('GET /api/v1/audit-logs - Lấy danh sách nhật ký Audit Log (Admin)', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
