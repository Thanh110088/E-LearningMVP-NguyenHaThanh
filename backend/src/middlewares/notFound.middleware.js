/**
 * Đặt SAU tất cả app.use('/api/...') trong app.js.
 * Request không khớp route nào → 404 JSON, rồi errorHandler format response.
 */
const { NotFoundError } = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Không tìm thấy ${req.method} ${req.originalUrl}`));
};

module.exports = notFoundHandler;
