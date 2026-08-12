const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Workspace Module Integration Tests', () => {
  const teacherUser = {
    email: `teacher_ws_${Date.now()}@elearning.com`,
    password: 'TeacherPassword123',
    fullName: 'Test Teacher Workspace',
  };

  let token = '';

  beforeAll(async () => {
    // Register test teacher
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send(teacherUser);

    token = regRes.body.data.accessToken;

    // Set role to TEACHER
    await prisma.user.update({
      where: { email: teacherUser.email },
      data: { role: 'TEACHER', plan: 'FREE' },
    });
  });

  afterAll(async () => {
    // Clean up created exams, questions, workspaces, and user
    const user = await prisma.user.findUnique({ where: { email: teacherUser.email } });
    if (user) {
      await prisma.exam.deleteMany({ where: { createdById: user.id } });
      await prisma.workspace.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('GET /api/v1/workspaces - Auto creates default workspace for teacher', async () => {
    const res = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.workspaces.length).toBe(1);
    expect(res.body.data.usage.max).toBe(1);
    expect(res.body.data.usage.canCreateMore).toBe(false);
  });

  it('POST /api/v1/workspaces - Rejects 2nd workspace creation on FREE plan', async () => {
    const res = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Workspace Thu 2',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('cho phép tối đa 1 Workspace');
  });

  it('POST /api/v1/workspaces - Allows workspace creation up to 5 on PRO plan', async () => {
    // Upgrade teacher to PRO
    await prisma.user.update({
      where: { email: teacherUser.email },
      data: { plan: 'PRO' },
    });

    const createRes = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Workspace Lớp Toán 10',
        description: 'Chuyên Toán 10',
        color: '#3b82f6',
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.name).toBe('Workspace Lớp Toán 10');

    const getRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.body.data.workspaces.length).toBe(2);
    expect(getRes.body.data.usage.max).toBe(5);
    expect(getRes.body.data.usage.canCreateMore).toBe(true);
  });

  it('POST /api/v1/exams - Creates an exam attached to selected workspace', async () => {
    const wsRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`);

    const activeWs = wsRes.body.data.workspaces[0];
    const subject = await prisma.subject.findFirst();
    const grade = await prisma.grade.findFirst();

    const examRes = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', activeWs.id)
      .send({
        title: 'Đề Thi Thử Toán 10 Workspace Test',
        code: `WS-EXAM-${Date.now()}`,
        subjectId: subject ? subject.id : undefined,
        gradeId: grade ? grade.id : undefined,
        durationMinutes: 45,
      });

    expect(examRes.statusCode).toBe(201);
    expect(examRes.body.success).toBe(true);
    expect(examRes.body.data.workspaceId).toBe(activeWs.id);
  });

  it('POST /api/v1/questions - Creates a question attached to selected workspace', async () => {
    const wsRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${token}`);

    const activeWs = wsRes.body.data.workspaces[0];

    const qRes = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Workspace-Id', activeWs.id)
      .send({
        content: 'Workspace Test Question Content',
        type: 'SINGLE_CHOICE',
        difficulty: 'EASY',
        points: 1.0,
        options: [
          { content: 'Đáp án A', isCorrect: true },
          { content: 'Đáp án B', isCorrect: false },
        ],
      });

    expect(qRes.statusCode).toBe(201);
    expect(qRes.body.success).toBe(true);
    expect(qRes.body.data.workspaceId).toBe(activeWs.id);
  });
});
