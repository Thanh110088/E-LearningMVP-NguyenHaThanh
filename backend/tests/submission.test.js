const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Submission & Exam Engine Integration Tests', () => {
  let token = '';
  let examId = '';
  let questionId = '';
  let correctOptionId = '';
  let submissionId = '';

  beforeAll(async () => {
    // 1. Get or create test user token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@elearning.com',
        password: 'Student123456',
      });

    if (loginRes.statusCode === 200) {
      token = loginRes.body.data.token;
    }

    // 2. Get published exam
    const exam = await prisma.exam.findFirst({
      where: { status: 'PUBLISHED' },
      include: { questions: { include: { options: true } } },
    });

    if (exam) {
      examId = exam.id;
      if (exam.questions && exam.questions.length > 0) {
        questionId = exam.questions[0].id;
        const correctOpt = exam.questions[0].options.find(o => o.isCorrect);
        if (correctOpt) {
          correctOptionId = correctOpt.id;
        }
      }
    }
  });

  afterAll(async () => {
    if (submissionId) {
      await prisma.submission.deleteMany({ where: { id: submissionId } });
    }
    await prisma.$disconnect();
  });

  it('POST /api/v1/submissions/start/:examId - Bắt đầu làm bài thi', async () => {
    if (!token || !examId) return;

    const res = await request(app)
      .post(`/api/v1/submissions/start/${examId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    submissionId = res.body.data.id;
  });

  it('POST /api/v1/submissions/:id/submit - Nộp bài và chấm điểm tự động', async () => {
    if (!token || !submissionId) return;

    const answers = [
      {
        questionId,
        selectedOptionIds: [correctOptionId],
      },
    ];

    const res = await request(app)
      .post(`/api/v1/submissions/${submissionId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('score');
    expect(res.body.data).toHaveProperty('isPassed');
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('GET /api/v1/submissions/:id/result - Lấy chi tiết kết quả bài làm', async () => {
    if (!token || !submissionId) return;

    const res = await request(app)
      .get(`/api/v1/submissions/${submissionId}/result`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(submissionId);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});
