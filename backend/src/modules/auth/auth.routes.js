/**
 * Routes = "bản đồ URL".
 * Thứ tự từng request: validBodyRequest? → authenticate? → controller
 *
 * Ví dụ POST /api/v1/auth/login:
 *   1. Zod kiểm tra body { email, password }
 *   2. AuthController.login (đã bọc handleAsync)
 */
const express = require('express');
const authController = require('./auth.controller');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('./auth.schema');

const router = express.Router();

router.post('/register', validBodyRequest(registerSchema), authController.register); // tạo tài khoản, gửi mail
router.post('/login', validBodyRequest(loginSchema), authController.login); // mật khẩu → cookie
router.post('/google', validBodyRequest(googleLoginSchema), authController.googleLogin); // GIS idToken → cookie
router.post('/verify-email', validBodyRequest(verifyEmailSchema), authController.verifyEmail); // kích hoạt + auto login
router.post('/resend-verification', validBodyRequest(resendVerificationSchema), authController.resendVerification); // gửi lại mail
router.post('/forgot-password', validBodyRequest(forgotPasswordSchema), authController.forgotPassword); // mail reset MK
router.post('/reset-password', validBodyRequest(resetPasswordSchema), authController.resetPassword); // đổi MK từ link
router.post('/refresh-token', validBodyRequest(refreshTokenSchema), authController.refreshToken); // xoay JWT
router.post('/logout', authController.logout); // thu hồi refresh + xóa cookie
router.post('/change-password', authenticate, validBodyRequest(changePasswordSchema), authController.changePassword); // đổi MK đã login
router.get('/me', authenticate, authController.getProfile); // profile từ cookie

module.exports = router;
