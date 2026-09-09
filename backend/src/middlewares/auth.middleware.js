/**
 * authenticate: "ai đang gọi API?" → gắn req.user
 * authorize(...roles): "người này có được làm việc này không?"
 *
 * Thứ tự trên route: authenticate rồi mới authorize
 *   router.delete('/:id', authenticate, authorize('ADMIN'), controller.delete)
 */
const { UnauthorizedError, ForbiddenError } = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/token.util');
const { readAccessToken } = require('../utils/cookie.util');
const { handleAsync } = require('../utils/handleAsync');
const prisma = require('../config/prisma');

const authenticate = handleAsync(async (req, res, next) => {
  const token = readAccessToken(req);
  if (!token) {
    return next(new UnauthorizedError('Vui lòng đăng nhập để truy cập tài nguyên'));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token); // kiểm tra chữ ký + hạn JWT
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token đã hết hạn, vui lòng làm mới token'));
    }
    return next(new UnauthorizedError('Token không hợp lệ'));
  }

  // Query lại DB: JWT có thể còn hạn nhưng tài khoản đã bị khóa
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      plan: true,
      isActive: true,
      emailVerified: true,
      provider: true,
    },
  });

  if (!user || !user.isActive) {
    return next(new UnauthorizedError('Tài khoản không hợp lệ hoặc đã bị khóa'));
  }

  req.user = user; // các controller phía sau đọc req.user.id, req.user.role
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ForbiddenError('Bạn không có quyền truy cập tài nguyên này'));
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
};
