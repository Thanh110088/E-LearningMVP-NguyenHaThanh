const prisma = require('../../config/prisma');

class CategoryRepository {
  // Subject
  async findAllSubjects() {
    return prisma.subject.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { exams: true } }
      }
    });
  }

  async findSubjectById(id) {
    return prisma.subject.findUnique({ where: { id } });
  }

  async findSubjectByCode(code) {
    return prisma.subject.findUnique({ where: { code } });
  }

  async createSubject(data) {
    return prisma.subject.create({ data });
  }

  async updateSubject(id, data) {
    return prisma.subject.update({ where: { id }, data });
  }

  async deleteSubject(id) {
    return prisma.subject.delete({ where: { id } });
  }

  // Grade
  async findAllGrades() {
    return prisma.grade.findMany({
      orderBy: { level: 'asc' },
      include: {
        _count: { select: { exams: true } }
      }
    });
  }

  async findGradeById(id) {
    return prisma.grade.findUnique({ where: { id } });
  }

  async findGradeByCode(code) {
    return prisma.grade.findUnique({ where: { code } });
  }

  async createGrade(data) {
    return prisma.grade.create({ data });
  }

  async updateGrade(id, data) {
    return prisma.grade.update({ where: { id }, data });
  }

  async deleteGrade(id) {
    return prisma.grade.delete({ where: { id } });
  }
}

module.exports = new CategoryRepository();
