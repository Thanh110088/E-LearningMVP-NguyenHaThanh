const prisma = require('../../config/prisma');

class LeaderboardService {
  async getTopStudents() {
    const submissions = await prisma.submission.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        exam: { select: { title: true, totalPoints: true } },
      },
      orderBy: [
        { score: 'desc' },
        { submittedAt: 'asc' },
      ],
      take: 20,
    });

    return submissions;
  }
}

module.exports = new LeaderboardService();
