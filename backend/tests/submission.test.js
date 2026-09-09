const prisma = require('../src/config/prisma');
const { loginAgent } = require('./helpers/auth');

describe('Submission & Exam Engine Integration Tests', () => {
  let agent;
  let examId = '';
  let questionId = '';
  let correctOptionId = '';
  let submissionId = '';

  beforeAll(async () => {
    const login = await loginAgent('student@elearning.com', 'Student123456');
    agent = login.agent;
    if (login.res.statusCode !== 200) {
      throw new Error(`Student login failed: ${login.res.body?.message || login.res.statusCode}`);
    }

    const exam = await prisma.exam.findFirst({
      where: { status: 'PUBLISHED', questions: { some: {} } },
      include: { questions: { include: { options: true } } },
    });

    if (exam) {
      examId = exam.id;
      if (exam.questions && exam.questions.length > 0) {
        questionId = exam.questions[0].id;
        const correctOpt = exam.questions[0].options.find((o) => o.isCorrect);
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
    if (!examId) return;

    const res = await agent.post(`/api/v1/submissions/start/${examId}`).send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    submissionId = res.body.data.id;
  });

  it('POST /api/v1/submissions/:id/submit - Nộp bài và chấm điểm tự động', async () => {
    if (!submissionId) return;

    const answers = [
      {
        questionId,
        selectedOptionIds: [correctOptionId],
      },
    ];

    const res = await agent.post(`/api/v1/submissions/${submissionId}/submit`).send({ answers });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('score');
    expect(res.body.data).toHaveProperty('isPassed');
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('GET /api/v1/submissions/:id/result - Lấy chi tiết kết quả bài làm', async () => {
    if (!submissionId) return;

    const res = await agent.get(`/api/v1/submissions/${submissionId}/result`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(submissionId);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});
