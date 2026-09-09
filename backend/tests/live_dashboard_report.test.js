const prisma = require('../src/config/prisma');
const { loginAgent } = require('./helpers/auth');

describe('Sprint 3 & Sprint 4 Integration Tests', () => {
  let agent;

  beforeAll(async () => {
    const login = await loginAgent('admin@elearning.com', 'Admin123456');
    agent = login.agent;
    if (login.res.statusCode !== 200) {
      throw new Error(`Admin login failed: ${login.res.body?.message || login.res.statusCode}`);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/v1/dashboard/stats - Lấy số liệu thống kê Dashboard', async () => {
    const res = await agent.get('/api/v1/dashboard/stats');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalExams');
    expect(res.body.data).toHaveProperty('totalSubmissions');
  });

  it('GET /api/v1/leaderboard - Lấy bảng xếp hạng điểm cao', async () => {
    const res = await agent.get('/api/v1/leaderboard');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/reports - Lấy dữ liệu báo cáo các lượt làm bài', async () => {
    const res = await agent.get('/api/v1/reports');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/reports/export - Xuất file CSV báo cáo lượt thi', async () => {
    const res = await agent.get('/api/v1/reports/export');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
  });

  it('GET /api/v1/audit-logs - Lấy danh sách nhật ký Audit Log (Admin)', async () => {
    const res = await agent.get('/api/v1/audit-logs');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
