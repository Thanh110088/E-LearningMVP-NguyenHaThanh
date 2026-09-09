/**
 * Chuẩn hóa JSON trả về client.
 * Mọi API thành công: { success: true, message, data, meta? }
 * Lỗi thường đi qua error.middleware, không cần gọi sendError ở controller nữa.
 */
const sendSuccess = (res, message, data = null, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
