const catalogRepository = require('./catalog.repository');

class CatalogService {
  async getCatalog(query) {
    const { subjectId, gradeId, search, page = 1, limit = 12 } = query;
    return catalogRepository.findExams({
      subjectId,
      gradeId,
      search,
      page: Number(page),
      limit: Number(limit)
    });
  }

  async getExamDetail(id) {
    const exam = await catalogRepository.findExamById(id);
    if (!exam) {
      const error = new Error('Không tìm thấy đề thi');
      error.statusCode = 404;
      throw error;
    }
    return exam;
  }
}

module.exports = new CatalogService();
