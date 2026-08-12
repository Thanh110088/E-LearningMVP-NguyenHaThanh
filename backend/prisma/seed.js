const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Password Hashing
  const adminPassword = await bcrypt.hash('Admin123456', 10);
  const teacherPassword = await bcrypt.hash('Teacher123456', 10);
  const studentPassword = await bcrypt.hash('Student123456', 10);

  // 2. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elearning.com' },
    update: {},
    create: {
      email: 'admin@elearning.com',
      password: adminPassword,
      fullName: 'Hệ Thống Admin',
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@elearning.com' },
    update: {},
    create: {
      email: 'teacher@elearning.com',
      password: teacherPassword,
      fullName: 'Thầy Nguyễn Văn A',
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@elearning.com' },
    update: {},
    create: {
      email: 'student@elearning.com',
      password: studentPassword,
      fullName: 'Em Trần Thị B',
      role: 'STUDENT',
    },
  });

  console.log('✅ Users seeded: Admin, Teacher, Student');

  // 3. Subjects
  const math = await prisma.subject.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      name: 'Toán Học',
      code: 'MATH',
      description: 'Toán học phổ thông đại số & hình học',
      icon: 'calculator',
    },
  });

  const english = await prisma.subject.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      name: 'Tiếng Anh',
      code: 'ENG',
      description: 'Anh văn giao tiếp và ngữ pháp chuyên sâu',
      icon: 'languages',
    },
  });

  const physics = await prisma.subject.upsert({
    where: { code: 'PHYS' },
    update: {},
    create: {
      name: 'Vật Lý',
      code: 'PHYS',
      description: 'Vật lý đại cương và ứng dụng',
      icon: 'atom',
    },
  });

  console.log('✅ Subjects seeded');

  // 4. Grades
  const grade10 = await prisma.grade.upsert({
    where: { code: 'G10' },
    update: {},
    create: {
      name: 'Khối 10',
      code: 'G10',
      description: 'Chương trình trung học phổ thông Lớp 10',
      level: 10,
    },
  });

  const grade12 = await prisma.grade.upsert({
    where: { code: 'G12' },
    update: {},
    create: {
      name: 'Khối 12',
      code: 'G12',
      description: 'Chương trình luyện thi THPT Quốc Gia Lớp 12',
      level: 12,
    },
  });

  console.log('✅ Grades seeded');

  // 5. Sample Exams
  const exam1 = await prisma.exam.upsert({
    where: { code: 'EXAM-THPT-MATH-01' },
    update: {},
    create: {
      title: 'Đề Thi Thử THPT Quốc Gia Môn Toán 2026',
      description: 'Đề thi chuẩn cấu trúc Bộ GD&ĐT với các câu hỏi phân hóa từ dễ đến nâng cao.',
      code: 'EXAM-THPT-MATH-01',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop',
      durationMinutes: 90,
      totalPoints: 10.0,
      passPoints: 5.0,
      status: 'PUBLISHED',
      subjectId: math.id,
      gradeId: grade12.id,
      createdById: teacher.id,
    },
  });

  const exam2 = await prisma.exam.upsert({
    where: { code: 'EXAM-ENG-10-MID' },
    update: {},
    create: {
      title: 'Đề Kiểm Tra Giữa Kỳ I Tiếng Anh Khối 10',
      description: 'Đánh giá kiến thức ngữ pháp Unit 1-4 và từ vựng chủ đề School & Life.',
      code: 'EXAM-ENG-10-MID',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop',
      durationMinutes: 45,
      totalPoints: 10.0,
      passPoints: 6.0,
      status: 'PUBLISHED',
      subjectId: english.id,
      gradeId: grade10.id,
      createdById: teacher.id,
    },
  });

  console.log('✅ Sample Exams seeded');

  // 6. Sample Questions for Exam 1 (Math)
  const existingMathQuestions = await prisma.question.count({ where: { examId: exam1.id } });
  if (existingMathQuestions === 0) {
    await prisma.question.create({
      data: {
        content: 'Tập xác định của hàm số y = 1 / (x - 2) là:',
        type: 'SINGLE_CHOICE',
        points: 5.0,
        difficulty: 'EASY',
        explanation: 'Hàm số xác định khi mẫu số khác 0, tức x - 2 ≠ 0 <=> x ≠ 2. Do đó D = R \\ {2}.',
        examId: exam1.id,
        subjectId: math.id,
        options: {
          create: [
            { content: 'D = R', isCorrect: false },
            { content: 'D = R \\ {2}', isCorrect: true },
            { content: 'D = (2; +∞)', isCorrect: false },
            { content: 'D = (-∞; 2)', isCorrect: false },
          ],
        },
      },
    });

    await prisma.question.create({
      data: {
        content: 'Đạo hàm của hàm số y = x^3 - 3x + 1 là:',
        type: 'SINGLE_CHOICE',
        points: 5.0,
        difficulty: 'MEDIUM',
        explanation: 'Ta có y\' = (x^3)\' - (3x)\' + (1)\' = 3x^2 - 3.',
        examId: exam1.id,
        subjectId: math.id,
        options: {
          create: [
            { content: 'y\' = 3x^2 - 3', isCorrect: true },
            { content: 'y\' = 3x^2 + 3', isCorrect: false },
            { content: 'y\' = x^2 - 3', isCorrect: false },
            { content: 'y\' = 3x^2', isCorrect: false },
          ],
        },
      },
    });
  }

  // 7. Sample Questions for Exam 2 (English)
  const existingEngQuestions = await prisma.question.count({ where: { examId: exam2.id } });
  if (existingEngQuestions === 0) {
    await prisma.question.create({
      data: {
        content: 'Choose the correct form: "She ______ to school by bus every day."',
        type: 'SINGLE_CHOICE',
        points: 5.0,
        difficulty: 'EASY',
        explanation: 'Chủ ngữ "She" số ít ở thì hiện tại đơn đi với động từ thêm "es" -> goes.',
        examId: exam2.id,
        subjectId: english.id,
        options: {
          create: [
            { content: 'go', isCorrect: false },
            { content: 'goes', isCorrect: true },
            { content: 'going', isCorrect: false },
            { content: 'went', isCorrect: false },
          ],
        },
      },
    });

    await prisma.question.create({
      data: {
        content: 'Which of the following are primary colors? (Select all that apply)',
        type: 'MULTIPLE_CHOICE',
        points: 5.0,
        difficulty: 'MEDIUM',
        explanation: 'Primary colors in traditional color theory are Red, Blue, and Yellow.',
        examId: exam2.id,
        subjectId: english.id,
        options: {
          create: [
            { content: 'Red', isCorrect: true },
            { content: 'Green', isCorrect: false },
            { content: 'Blue', isCorrect: true },
            { content: 'Yellow', isCorrect: true },
          ],
        },
      },
    });
  }

  console.log('✅ Sample Questions & Options seeded');

  // 7. Seed Sample Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'USER_LOGIN',
        resource: 'User',
        details: JSON.stringify({ email: 'admin@elearning.com', role: 'ADMIN' }),
        ipAddress: '127.0.0.1',
      },
      {
        userId: teacher.id,
        action: 'CREATE_EXAM',
        resource: 'Exam',
        details: JSON.stringify({ title: 'Đề thi thử THPT Quốc Gia môn Toán 2026', code: 'EXAM-THPT-MATH-01' }),
        ipAddress: '127.0.0.1',
      },
      {
        userId: student.id,
        action: 'SUBMIT_EXAM',
        resource: 'Submission',
        details: JSON.stringify({ score: 10, isPassed: true, tabSwitchCount: 0 }),
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('✅ Sample Audit Logs seeded');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
