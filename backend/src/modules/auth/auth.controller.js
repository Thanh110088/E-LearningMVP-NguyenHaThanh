const authService = require("./auth.service");
const auditService = require("../audit/audit.service");
const { sendSuccess } = require("../../utils/response.util");

class AuthController {
  async register(req, res, next) {
    // TODO: Viết logic xử lý đăng ký tài khoản (gọi service, log audit, trả về response...) tại đây
    try {
      const result = await authService.register(req.body);
      auditService.logAction({
        userId: result.user?.id,
        action: "REGISTER",
        description: "Người dùng đã đăng ký tài khoản",
        resource: "User",
        details: { email: result.user?.email,role:result.user?.role },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return sendSuccess(res, "Đăng ký tài khoản thành công", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    // TODO: Viết logic xử lý đăng nhập (gọi service, log audit, trả về response...) tại đây
    try {
      const result = await authService.login(req.body);
      auditService.logAction({
        userId: result.user?.id,
        action: "USER_LOGIN",   
        resource: "User",
        details: { email: result.user?.email, role: result.user?.role },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return sendSuccess(res, "Đăng nhập thành công", result);
    }catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    // TODO: Viết logic xử lý làm mới token tại đây
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      return sendSuccess(res, "Làm mới token thành công", result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    // TODO: Viết logic xử lý lấy thông tin cá nhân (profile) của user tại đây
    try {
      const userId = req.user.id;
      const result = await authService.getProfile(userId);
      return sendSuccess(res, "Lấy thông tin cá nhân thành công", result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
