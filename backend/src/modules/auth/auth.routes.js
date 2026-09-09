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

router.post('/register', validBodyRequest(registerSchema), authController.register);
router.post('/login', validBodyRequest(loginSchema), authController.login);
router.post('/google', validBodyRequest(googleLoginSchema), authController.googleLogin);
router.post('/verify-email', validBodyRequest(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', validBodyRequest(resendVerificationSchema), authController.resendVerification);
router.post('/forgot-password', validBodyRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validBodyRequest(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', validBodyRequest(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/change-password', authenticate, validBodyRequest(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
