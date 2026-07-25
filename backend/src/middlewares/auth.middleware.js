const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const { sendError } = require('../utils/response.util');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Vui lòng đăng nhập để truy cập tài nguyên', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, fullName: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Tài khoản không tồn tại hoặc đã bị khóa', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token đã hết hạn, vui lòng làm mới token', 401);
    }
    return sendError(res, 'Token không hợp lệ', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Bạn không có quyền thực hiện thao tác này', 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
