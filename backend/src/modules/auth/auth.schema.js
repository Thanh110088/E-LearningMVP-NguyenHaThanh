/**
 * Zod schema = "khuôn" JSON body.
 * z.object({ email: z.string().email() }) nghĩa là body.email phải là chuỗi email hợp lệ.
 * .transform: sửa data trước khi vào controller (email luôn lowercase).
 * .optional().default: client không gửi thì dùng STUDENT.
 */
const { z } = require('zod');

/** Quy tắc mật khẩu dùng chung register / reset / change. */
const passwordSchema = z
  .string()
  .min(6, 'Mật khẩu phải từ 6 ký tự trở lên')
  .max(72, 'Mật khẩu tối đa 72 ký tự'); // bcrypt chỉ lấy 72 ký tự đầu

/** Body POST /register */
const registerSchema = z.object({
  email: z.string().email('Email không đúng định dạng').transform((v) => v.toLowerCase()),
  password: passwordSchema,
  fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên').max(100),
  role: z.enum(['TEACHER', 'STUDENT']).optional().default('STUDENT'),
});

/** Body POST /login */
const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

/** Body POST /google — idToken do Google Identity Services trả. */
const googleLoginSchema = z.object({
  idToken: z.string().min(10, 'Google idToken không hợp lệ'),
});

/** Body POST /refresh-token — cookie là chính; body.refreshToken chỉ dự phòng Postman. */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token là bắt buộc').optional(), // thường lấy từ cookie, body chỉ dự phòng
});

/** Body POST /verify-email */
const verifyEmailSchema = z.object({
  token: z.string().min(16, 'Token xác thực không hợp lệ'),
});

/** Body POST /resend-verification */
const resendVerificationSchema = z.object({
  email: z.string().email('Email không đúng định dạng').transform((v) => v.toLowerCase()),
});

/** Body POST /forgot-password */
const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng').transform((v) => v.toLowerCase()),
});

/** Body POST /reset-password */
const resetPasswordSchema = z.object({
  token: z.string().min(16, 'Token đặt lại mật khẩu không hợp lệ'),
  newPassword: passwordSchema,
});

/** Body POST /change-password (cần authenticate) */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: passwordSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
