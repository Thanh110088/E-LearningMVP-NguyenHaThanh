const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/response.util');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, 'Đăng ký tài khoản thành công', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, 'Đăng nhập thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      return sendSuccess(res, 'Làm mới token thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return sendSuccess(res, 'Lấy thông tin cá nhân thành công', profile, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
