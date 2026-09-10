const { ValidationError } = require('../utils/AppError');

/**
 * Middleware validate BODY bằng Zod.
 *
 * Cách dùng trên route:
 *   router.post('/login', validBodyRequest(loginSchema), controller.login)
 *
 * Zod schema.describe "hình dạng" JSON body (email phải là email, password ≥ 6...).
 * - safeParse: không throw, trả { success, data } hoặc { success: false, error }
 * - fail → ValidationError 400, kèm errors[] từng field
 * - ok → gán req.body = data đã chuẩn hóa (lowercase email, default role...)
 */
/** Trả middleware: parse Zod trên req.body, fail → 400, ok → ghi đè req.body. */
const validBodyRequest = (schema) => (req, res, next) => {
  if (!schema) return next();

  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = (result.error.issues || []).map((issue) => ({
      field: issue.path.length ? issue.path.join('.') : 'body',
      message: issue.message,
    }));
    return next(new ValidationError('Dữ liệu đầu vào không hợp lệ', errors));
  }

  req.body = result.data;
  return next();
};

module.exports = validBodyRequest;
