const { wrapController } = require('../../utils/handleAsync');
const categoryService = require('./category.service');
const { sendSuccess } = require('../../utils/response.util');

class CategoryController {
  async getSubjects(req, res) {
    const subjects = await categoryService.getAllSubjects();
    return sendSuccess(res, 'Lấy danh sách môn học thành công', subjects);
  }

  async createSubject(req, res) {
    const subject = await categoryService.createSubject(req.body);
    return sendSuccess(res, 'Thêm môn học thành công', subject, 201);
  }

  async updateSubject(req, res) {
    const subject = await categoryService.updateSubject(req.params.id, req.body);
    return sendSuccess(res, 'Cập nhật môn học thành công', subject);
  }

  async deleteSubject(req, res) {
    await categoryService.deleteSubject(req.params.id);
    return sendSuccess(res, 'Xóa môn học thành công');
  }

  async getGrades(req, res) {
    const grades = await categoryService.getAllGrades();
    return sendSuccess(res, 'Lấy danh sách khối lớp thành công', grades);
  }

  async createGrade(req, res) {
    const grade = await categoryService.createGrade(req.body);
    return sendSuccess(res, 'Thêm khối lớp thành công', grade, 201);
  }

  async updateGrade(req, res) {
    const grade = await categoryService.updateGrade(req.params.id, req.body);
    return sendSuccess(res, 'Cập nhật khối lớp thành công', grade);
  }

  async deleteGrade(req, res) {
    await categoryService.deleteGrade(req.params.id);
    return sendSuccess(res, 'Xóa khối lớp thành công');
  }
}

module.exports = wrapController(new CategoryController());
