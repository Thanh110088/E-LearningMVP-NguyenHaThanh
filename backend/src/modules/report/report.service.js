const prisma = require('../../config/prisma');

class ReportService {
  async getSubmissionReports() {
    const submissions = await prisma.submission.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: { select: { fullName: true, email: true } },
        exam: { select: { title: true, code: true, passPoints: true, totalPoints: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions;
  }

  async exportSubmissionsCSV() {
    const submissions = await this.getSubmissionReports();
    
    // Construct CSV Header & Content
    let csv = 'Hoc Sinh,Email,De Thi,Ma De,Diem So,Tong Diem,Ket Qua,Thoi Gian Nop\n';
    
    submissions.forEach(sub => {
      const studentName = `"${(sub.user.fullName || '').replace(/"/g, '""')}"`;
      const email = sub.user.email;
      const examTitle = `"${(sub.exam.title || '').replace(/"/g, '""')}"`;
      const code = sub.exam.code;
      const score = sub.score;
      const totalPoints = sub.exam.totalPoints;
      const result = sub.isPassed ? 'PASSED' : 'FAILED';
      const submittedAt = new Date(sub.submittedAt).toISOString();

      csv += `${studentName},${email},${examTitle},${code},${score},${totalPoints},${result},${submittedAt}\n`;
    });

    return csv;
  }
}

module.exports = new ReportService();
