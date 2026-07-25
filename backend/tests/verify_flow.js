const prisma = require('../src/config/prisma');
const liveService = require('../src/modules/live/live.service');
const submissionService = require('../src/modules/submission/submission.service');

async function testFlow() {
  console.log('--- TESTING LIVE & SUBMISSION FLOW ---');
  
  // 1. Get student user
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  console.log('Student:', student.email, student.id);

  // 2. Get published exam
  const exam = await prisma.exam.findFirst({
    where: { status: 'PUBLISHED', questions: { some: {} } },
    include: { _count: { select: { questions: true } } }
  });

  if (!exam) {
    console.error('❌ No published exam with questions found!');
    process.exit(1);
  }

  console.log('Found Published Exam:', exam.title, '| Code:', exam.code, '| ID:', exam.id, '| Questions:', exam._count.questions);

  // 3. Test Join Live PIN
  const liveResult = await liveService.joinLiveRoom(exam.code);
  console.log('✅ Live Join Success for PIN/Code:', liveResult.code);

  // 4. Test Start Exam Session
  const subResult = await submissionService.startExam(exam.id, student.id);
  console.log('✅ Start Exam Session Success! Submission ID:', subResult.id, '| Status:', subResult.status);

  console.log('--- ALL FLOWS VERIFIED SUCCESSFULLY ---');
  process.exit(0);
}

testFlow().catch(err => {
  console.error('❌ FLOW ERROR:', err);
  process.exit(1);
});
