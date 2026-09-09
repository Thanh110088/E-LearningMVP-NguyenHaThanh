/**
 * Error middleware tập trung — CHỮ KÝ 4 THAM SỐ (err, req, res, next)
 * Express nhận diện đây là error handler. Mọi next(err) / throw từ handleAsync đều tới đây.
 *
 * Việc chính: biến mọi kiểu lỗi (Zod, JWT, Prisma, JSON hỏng...) thành JSON thống nhất.
 */
const logger = require('../config/logger');
const config = require('../config');
const { AppError, ValidationError } = require('../utils/AppError');

const buildErrorPayload = (err, statusCode) => {
  const hideDetails = statusCode >= 500 && config.isProduction;
  const payload = {
    success: false,
    message: hideDetails ? 'Lỗi hệ thống, vui lòng thử lại sau' : err.message || 'Internal Server Error',
  };

  if (err.errors) payload.errors = err.errors;
  if (err.requiresPassword) payload.requiresPassword = true;
  if (err.examStartTime) payload.examStartTime = err.examStartTime;
  if (err.code && typeof err.code === 'string' && !err.code.startsWith('P')) {
    payload.code = err.code; // ví dụ EMAIL_NOT_VERIFIED — frontend đọc để hiện "gửi lại mail"
  }
  if (!config.isProduction && err.stack) {
    payload.stack = err.stack;
  }
  return payload;
};

const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  if (err.name === 'ZodError') {
    const errors = (err.issues || err.errors || []).map((issue) => ({
      field: (issue.path || []).join('.'),
      message: issue.message,
    }));
    return new ValidationError('Dữ liệu đầu vào không hợp lệ', errors);
  }

  if (err.name === 'JsonWebTokenError') {
    const error = new Error('Token không hợp lệ');
    error.statusCode = 401;
    return error;
  }

  if (err.name === 'TokenExpiredError') {
    const error = new Error('Token đã hết hạn, vui lòng làm mới token');
    error.statusCode = 401;
    return error;
  }

  // Prisma: unique constraint (email / tokenHash trùng)
  if (err.code === 'P2002') {
    const fields = err.meta?.target;
    const error = new Error(
      Array.isArray(fields) && fields.length
        ? `Giá trị ${fields.join(', ')} đã tồn tại`
        : 'Dữ liệu bị trùng lặp'
    );
    error.statusCode = 409;
    return error;
  }

  // Prisma: update/delete bản ghi không tồn tại
  if (err.code === 'P2025') {
    const error = new Error('Không tìm thấy bản ghi cần thao tác');
    error.statusCode = 404;
    return error;
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    const error = new Error('JSON không hợp lệ');
    error.statusCode = 400;
    return error;
  }

  if (err.name === 'MulterError') {
    const error = new Error(err.message || 'Lỗi tải tệp');
    error.statusCode = 400;
    return error;
  }

  return err;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const normalized = normalizeError(err);
  const statusCode = normalized.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(normalized);
  } else {
    logger.warn(normalized);
  }

  return res.status(statusCode).json(buildErrorPayload(normalized, statusCode));
};

module.exports = errorHandler;
