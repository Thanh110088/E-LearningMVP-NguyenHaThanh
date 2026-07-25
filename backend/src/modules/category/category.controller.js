const categoryService = require('./category.service');
const { sendSuccess } = require('../../utils/response.util');

class CategoryController {
  // Subjects
  async getSubjects(req, res, next) {
    try {
      const subjects = await categoryService.getAllSubjects();
      return sendSuccess(res, 'Lấy danh sách môn học thành công', subjects);
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req, res, next) {
    try {
      const subject = await categoryService.createSubject(req.body);
      return sendSuccess(res, 'Thêm môn học thành công', subject, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const subject = await categoryService.updateSubject(req.params.id, req.body);
      return sendSuccess(res, 'Cập nhật môn học thành công', subject);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubject(req, res, next) {
    try {
      await categoryService.deleteSubject(req.params.id);
      return sendSuccess(res, 'Xóa môn học thành công');
    } catch (error) {
      next(error);
    }
  }

  // Grades
  async getGrades(req, res, next) {
    try {
      const grades = await categoryService.getAllGrades();
      return sendSuccess(res, 'Lấy danh sách khối lớp thành công', grades);
    } catch (error) {
      next(error);
    }
  }

  async createGrade(req, res, next) {
    try {
      const grade = await categoryService.createGrade(req.body);
      return sendSuccess(res, 'Thêm khối lớp thành công', grade, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateGrade(req, res, next) {
    try {
      const grade = await categoryService.updateGrade(req.params.id, req.body);
      return sendSuccess(res, 'Cập nhật khối lớp thành công', grade);
    } catch (error) {
      next(error);
    }
  }

  async deleteGrade(req, res, next) {
    try {
      await categoryService.deleteGrade(req.params.id);
      return sendSuccess(res, 'Xóa khối lớp thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
