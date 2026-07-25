const categoryRepository = require('./category.repository');

class CategoryService {
  // Subjects
  async getAllSubjects() {
    return categoryRepository.findAllSubjects();
  }

  async createSubject(data) {
    const existing = await categoryRepository.findSubjectByCode(data.code);
    if (existing) {
      const error = new Error('Mã môn học đã tồn tại');
      error.statusCode = 400;
      throw error;
    }
    return categoryRepository.createSubject(data);
  }

  async updateSubject(id, data) {
    const subject = await categoryRepository.findSubjectById(id);
    if (!subject) {
      const error = new Error('Không tìm thấy môn học');
      error.statusCode = 404;
      throw error;
    }
    return categoryRepository.updateSubject(id, data);
  }

  async deleteSubject(id) {
    const subject = await categoryRepository.findSubjectById(id);
    if (!subject) {
      const error = new Error('Không tìm thấy môn học');
      error.statusCode = 404;
      throw error;
    }
    return categoryRepository.deleteSubject(id);
  }

  // Grades
  async getAllGrades() {
    return categoryRepository.findAllGrades();
  }

  async createGrade(data) {
    const existing = await categoryRepository.findGradeByCode(data.code);
    if (existing) {
      const error = new Error('Mã khối lớp đã tồn tại');
      error.statusCode = 400;
      throw error;
    }
    return categoryRepository.createGrade(data);
  }

  async updateGrade(id, data) {
    const grade = await categoryRepository.findGradeById(id);
    if (!grade) {
      const error = new Error('Không tìm thấy khối lớp');
      error.statusCode = 404;
      throw error;
    }
    return categoryRepository.updateGrade(id, data);
  }

  async deleteGrade(id) {
    const grade = await categoryRepository.findGradeById(id);
    if (!grade) {
      const error = new Error('Không tìm thấy khối lớp');
      error.statusCode = 404;
      throw error;
    }
    return categoryRepository.deleteGrade(id);
  }
}

module.exports = new CategoryService();
