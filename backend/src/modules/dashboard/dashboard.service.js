const prisma = require('../../config/prisma');

class DashboardService {
  async getStats() {
    const [
      totalExams,
      totalQuestions,
      totalStudents,
      totalSubmissions,
      passedSubmissions,
      recentSubmissions,
    ] = await Promise.all([
      prisma.exam.count(),
      prisma.question.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.submission.count({ where: { status: 'COMPLETED' } }),
      prisma.submission.count({ where: { status: 'COMPLETED', isPassed: true } }),
      prisma.submission.findMany({
        where: { status: 'COMPLETED' },
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true } },
          exam: { select: { title: true, code: true } },
        },
      }),
    ]);

    const passRate = totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    // Monthly or recent chart data
    const chartData = [
      { name: 'Đạt (Passed)', value: passedSubmissions, color: '#10b981' },
      { name: 'Không Đạt (Failed)', value: totalSubmissions - passedSubmissions, color: '#f43f5e' },
    ];

    return {
      totalExams,
      totalQuestions,
      totalStudents,
      totalSubmissions,
      passedSubmissions,
      passRate,
      chartData,
      recentSubmissions,
    };
  }
}

module.exports = new DashboardService();
