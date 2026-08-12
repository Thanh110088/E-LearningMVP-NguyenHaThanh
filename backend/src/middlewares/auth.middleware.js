const jwt = require("jsonwebtoken");
const config = require("../config");
const prisma = require("../config/prisma");
const { sendError } = require("../utils/response.util");

const authenticate = async (req, res, next) => {
  // TODO: Viết logic kiểm tra token và xác thực người dùng tại đây
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Vui long dang nhap de truy cap tai nguyen", 401);
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) {
      return sendError(res, "Tai khoan khong hop le", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token da het han ,vui long lam moi token", 401);
    }
    return sendError(res, "Token da het han ,vui long lam moi token", 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // TODO: Viết logic kiểm tra quyền (role) của người dùng tại đây
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Ban khong co quyen truy cap tai nguyen nay", 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
