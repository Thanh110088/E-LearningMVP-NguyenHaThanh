const prisma = require('../../config/prisma');

class LiveService {
  async joinLiveRoom(pinCode) {
    if (!pinCode || !pinCode.trim()) {
      const error = new Error('Vui lòng nhập mã PIN phòng thi');
      error.statusCode = 400;
      throw error;
    }

    const cleanedPin = pinCode.trim();

    const exam = await prisma.exam.findFirst({
      where: {
        status: 'PUBLISHED',
        OR: [
          { pinCode: cleanedPin },
          { code: cleanedPin },
          { code: { equals: `EXAM-${cleanedPin}`, mode: 'insensitive' } },
          { code: { contains: cleanedPin, mode: 'insensitive' } },
        ],
      },
      include: {
        subject: { select: { name: true, code: true } },
        grade: { select: { name: true, code: true } },
        createdBy: { select: { fullName: true } },
        _count: { select: { questions: true } },
      },
    });

    if (!exam) {
      const error = new Error('Mã PIN phòng thi không hợp lệ hoặc bài thi chưa được mở');
      error.statusCode = 404;
      throw error;
    }

    return exam;
  }
}

module.exports = new LiveService();
