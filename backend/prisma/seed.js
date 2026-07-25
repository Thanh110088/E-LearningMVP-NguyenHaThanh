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
      description: 'Đề thi chuẩn cấu trúc Bộ GD&ĐT với 50 câu hỏi phân hóa từ dễ đến nâng cao.',
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
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
