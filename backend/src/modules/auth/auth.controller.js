/**
 * Controller = lớp mỏng: nhận req, gọi service, set cookie, trả JSON.
 * KHÔNG chứa nghiệp vụ (hash password, gửi mail...) — việc đó ở auth.service.js
 *
 * wrapController: mọi method async throw lỗi → error middleware, khỏi try/catch.
 */
const authService = require('./auth.service');
const auditService = require('../audit/audit.service');
const { sendSuccess } = require('../../utils/response.util');
const { setAuthCookies, clearAuthCookies, readRefreshToken } = require('../../utils/cookie.util');
const { wrapController } = require('../../utils/handleAsync');

const requestMeta = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

class AuthController {
  async register(req, res) {
    // KHÔNG set cookie: user phải xác nhận email trước
    const result = await authService.register(req.body, requestMeta(req));
    auditService.logAction({
      userId: result.user?.id,
      action: 'REGISTER',
      description: 'Người dùng đã đăng ký tài khoản',
      resource: 'User',
      details: { email: result.user?.email, role: result.user?.role },
      ...requestMeta(req),
    });
    return sendSuccess(
      res,
      'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản',
      {
        user: result.user,
        requiresEmailVerification: true,
      },
      201
    );
  }

  async login(req, res) {
    const result = await authService.login(req.body, requestMeta(req));
    setAuthCookies(res, result); // token nằm cookie, body chỉ trả user
    auditService.logAction({
      userId: result.user?.id,
      action: 'USER_LOGIN',
      resource: 'User',
      details: { email: result.user?.email, role: result.user?.role, method: 'PASSWORD' },
      ...requestMeta(req),
    });
    return sendSuccess(res, 'Đăng nhập thành công', { user: result.user });
  }

  async googleLogin(req, res) {
    const result = await authService.loginWithGoogle(req.body.idToken, requestMeta(req));
    setAuthCookies(res, result);
    auditService.logAction({
      userId: result.user?.id,
      action: 'USER_LOGIN',
      resource: 'User',
      details: { email: result.user?.email, role: result.user?.role, method: 'GOOGLE' },
      ...requestMeta(req),
    });
    return sendSuccess(res, 'Đăng nhập Google thành công', { user: result.user });
  }

  async verifyEmail(req, res) {
    const result = await authService.verifyEmail(req.body.token, requestMeta(req));
    setAuthCookies(res, result); // xác nhận xong tự đăng nhập
    auditService.logAction({
      userId: result.user?.id,
      action: 'VERIFY_EMAIL',
      resource: 'User',
      details: { email: result.user?.email },
      ...requestMeta(req),
    });
    return sendSuccess(res, 'Xác nhận email thành công', { user: result.user });
  }

  async resendVerification(req, res) {
    await authService.resendVerification(req.body.email);
    // Câu trả lời chung: tránh kẻ xấu dò email nào đã đăng ký
    return sendSuccess(res, 'Nếu email tồn tại và chưa xác nhận, hệ thống đã gửi lại thư xác nhận');
  }

  async forgotPassword(req, res) {
    await authService.forgotPassword(req.body.email);
    return sendSuccess(res, 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu');
  }

  async resetPassword(req, res) {
    const result = await authService.resetPassword(req.body, requestMeta(req));
    clearAuthCookies(res); // phiên cũ vô hiệu → bắt login lại
    auditService.logAction({
      userId: result.user?.id,
      action: 'RESET_PASSWORD',
      resource: 'User',
      details: { email: result.user?.email },
      ...requestMeta(req),
    });
    return sendSuccess(res, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại');
  }

  async changePassword(req, res) {
    const result = await authService.changePassword(req.user.id, req.body, requestMeta(req));
    setAuthCookies(res, result); // cấp cookie mới vì refresh token cũ đã revoke
    auditService.logAction({
      userId: result.user?.id,
      action: 'CHANGE_PASSWORD',
      resource: 'User',
      details: { email: result.user?.email },
      ...requestMeta(req),
    });
    return sendSuccess(res, 'Đổi mật khẩu thành công', { user: result.user });
  }

  async refreshToken(req, res) {
    const token = readRefreshToken(req);
    const result = await authService.refreshToken(token, requestMeta(req));
    setAuthCookies(res, result); // rotation: cookie mới, token cũ chết
    return sendSuccess(res, 'Làm mới token thành công', { user: result.user });
  }

  async logout(req, res) {
    await authService.logout(readRefreshToken(req));
    clearAuthCookies(res);
    return sendSuccess(res, 'Đăng xuất thành công');
  }

  async getProfile(req, res) {
    const result = await authService.getProfile(req.user.id);
    return sendSuccess(res, 'Lấy thông tin cá nhân thành công', result);
  }
}

module.exports = wrapController(new AuthController());
