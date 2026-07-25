const prisma = require('../../config/prisma');

class CatalogRepository {
  async findExams({ subjectId, gradeId, search, status = 'PUBLISHED', page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = {
      status,
      ...(subjectId && { subjectId }),
      ...(gradeId && { gradeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [items, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true, code: true, icon: true } },
          grade: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
          _count: { select: { questions: true, submissions: true } }
        }
      }),
      prisma.exam.count({ where })
    ]);

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findExamById(id) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { questions: true, submissions: true } }
      }
    });
  }
}

module.exports = new CatalogRepository();
