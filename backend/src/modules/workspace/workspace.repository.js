const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WorkspaceRepository {
  async findByUserId(userId) {
    return prisma.workspace.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            exams: true,
            questions: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async findById(id) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            exams: true,
            questions: true,
          },
        },
      },
    });
  }

  async countByUserId(userId) {
    return prisma.workspace.count({
      where: { userId },
    });
  }

  async create(data) {
    return prisma.workspace.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.workspace.delete({
      where: { id },
    });
  }
}

module.exports = new WorkspaceRepository();
