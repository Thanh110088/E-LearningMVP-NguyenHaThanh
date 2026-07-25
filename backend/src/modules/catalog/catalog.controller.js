const catalogService = require('./catalog.service');
const { sendSuccess } = require('../../utils/response.util');

class CatalogController {
  async getCatalog(req, res, next) {
    try {
      const result = await catalogService.getCatalog(req.query);
      return sendSuccess(res, 'Lấy danh sách khám phá đề thi thành công', result.items, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getExamDetail(req, res, next) {
    try {
      const exam = await catalogService.getExamDetail(req.params.id);
      return sendSuccess(res, 'Lấy chi tiết đề thi thành công', exam);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CatalogController();
