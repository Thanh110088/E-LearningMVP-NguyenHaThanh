/**
 * Các lớp lỗi HTTP dùng chung.
 *
 * Thay vì `throw new Error('...')` rồi gán `error.statusCode = 401` thủ công,
 * ta throw đúng loại lỗi. error.middleware.js đọc `statusCode` để trả status.
 *
 * isOperational = true nghĩa là lỗi "dự kiến" (user sai mật khẩu, email trùng),
 * không phải bug hệ thống. Production sẽ ẩn chi tiết lỗi 500 (không operational / không có status).
 */

class AppError extends Error {
  constructor(message, statusCode = 500, extras = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    // extras: { errors, code, requiresPassword, ... } đính kèm vào JSON response
    Object.assign(this, extras);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/** 400 — client gửi sai (thiếu field, logic không hợp lệ) */
class BadRequestError extends AppError {
  constructor(message = 'Yêu cầu không hợp lệ', extras = {}) {
    super(message, 400, extras);
  }
}

/** 400 — riêng cho Zod: kèm mảng { field, message } */
class ValidationError extends BadRequestError {
  constructor(message = 'Dữ liệu đầu vào không hợp lệ', errors = []) {
    super(message, { errors });
  }
}

/** 401 — chưa đăng nhập / token sai / hết hạn */
class UnauthorizedError extends AppError {
  constructor(message = 'Vui lòng đăng nhập để truy cập tài nguyên', extras = {}) {
    super(message, 401, extras);
  }
}

/** 403 — đã đăng nhập nhưng không đủ quyền hoặc bị khóa / chưa verify email */
class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền truy cập tài nguyên này', extras = {}) {
    super(message, 403, extras);
  }
}

/** 404 — không tìm thấy resource */
class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên', extras = {}) {
    super(message, 404, extras);
  }
}

/** 409 — trùng dữ liệu (email đã tồn tại) */
class ConflictError extends AppError {
  constructor(message = 'Dữ liệu đã tồn tại', extras = {}) {
    super(message, 409, extras);
  }
}

/** 429 — bị giới hạn tần suất (dự phòng, chưa gắn rate-limit) */
class TooManyRequestsError extends AppError {
  constructor(message = 'Quá nhiều yêu cầu, vui lòng thử lại sau', extras = {}) {
    super(message, 429, extras);
  }
}

/** 503 — dịch vụ phụ thuộc chưa cấu hình (ví dụ Google OAuth thiếu CLIENT_ID) */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Dịch vụ tạm thời không khả dụng', extras = {}) {
    super(message, 503, extras);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  ServiceUnavailableError,
};
