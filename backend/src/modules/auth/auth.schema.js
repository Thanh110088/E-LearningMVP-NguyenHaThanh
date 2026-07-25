const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
    fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên'),
    role: z.enum(['TEACHER', 'STUDENT']).optional().default('STUDENT'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh Token là bắt buộc'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
