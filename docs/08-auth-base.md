# Auth Base Node.js — Cookie, Google & Email Verification

Tài liệu kỹ thuật cho hệ thống xác thực ETech sau khi nâng cấp thành auth-base hoàn chỉnh.

## 1. Mục tiêu

- Đăng nhập mật khẩu và đăng nhập Google.
- Xác thực email khi đăng ký, khi quên mật khẩu, khi đổi mật khẩu.
- `accessToken` / `refreshToken` nằm trong cookie `httpOnly` (không lưu token trên `localStorage`).
- Controller dùng `handleAsync` / `wrapController` — không `try/catch` rải rác.
- `validBodyRequest` + Zod validate body mọi API có payload.
- Error handler tập trung (JWT, Prisma, Zod, 404, JSON hỏng).

## 2. Luồng chính

```text
Đăng ký LOCAL
  → tạo user (emailVerified=false)
  → gửi mail VERIFY_EMAIL
  → user mở /verify-email?token=
  → set cookie + cho phép dùng hệ thống

Đăng nhập password
  → kiểm tra hash + emailVerified + isActive
  → set cookie accessToken + refreshToken
  → lưu hash refresh token (rotation)

Đăng nhập Google
  → verify Google ID token
  → tìm/tạo user, emailVerified=true
  → set cookie

Quên mật khẩu
  → luôn trả 200 (không lộ email tồn tại)
  → gửi mail RESET_PASSWORD nếu tài khoản LOCAL còn hoạt động

Đổi mật khẩu (đã đăng nhập)
  → kiểm tra mật khẩu hiện tại
  → revoke mọi refresh token
  → cấp cookie mới
  → gửi mail cảnh báo bảo mật
```

## 3. API Auth (`/api/v1/auth`)

| Method | Path | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| POST | `/register` | | Đăng ký, gửi email xác nhận. **Không** set cookie. |
| POST | `/login` | | Đăng nhập password, set cookie. |
| POST | `/google` | | Body `{ idToken }` từ Google Identity Services. |
| POST | `/verify-email` | | Body `{ token }`, kích hoạt + auto login. |
| POST | `/resend-verification` | | Gửi lại mail xác nhận. |
| POST | `/forgot-password` | | Gửi mail đặt lại mật khẩu. |
| POST | `/reset-password` | | Body `{ token, newPassword }`. |
| POST | `/change-password` | Cookie | Body `{ currentPassword, newPassword }`. |
| POST | `/refresh-token` | Cookie refresh | Xoay cặp token. |
| POST | `/logout` | | Thu hồi refresh token, xóa cookie. |
| GET | `/me` | Cookie / Bearer | Profile. |

Cookie:

- `accessToken` — JWT ngắn hạn (`JWT_EXPIRES_IN`, mặc định 15m), `httpOnly`, `SameSite=Lax`
- `refreshToken` — JWT dài hạn (`JWT_REFRESH_EXPIRES_IN`, mặc định 7d), hash lưu bảng `refresh_tokens`

`Authorization: Bearer <accessToken>` vẫn được chấp nhận (Postman / test), frontend dùng cookie + `withCredentials: true`.

## 4. Email

SMTP cấu hình qua `SMTP_*`. Nếu thiếu SMTP (dev/test), thư được ghi vào outbox bộ nhớ + log.

| Sự kiện | Template |
| :--- | :--- |
| Đăng ký | Xác nhận email (`VERIFY_EMAIL`, TTL 24h) |
| Quên mật khẩu | Liên kết đặt lại (`RESET_PASSWORD`, TTL 15m) |
| Đổi / reset mật khẩu | Cảnh báo bảo mật (không cần click xác nhận, thông báo đã đổi) |

Token email là chuỗi hex 64 ký tự, chỉ lưu **SHA-256** trên DB.

## 5. Google

1. Tạo OAuth Client ID (Web) trên Google Cloud.
2. Authorized JavaScript origins: `http://localhost:5173`
3. Gán `GOOGLE_CLIENT_ID` (backend) và `VITE_GOOGLE_CLIENT_ID` (frontend).
4. Frontend dùng Google Identity Services, gửi `idToken` lên `POST /auth/google`.

Nếu email Google trùng tài khoản LOCAL, hệ thống **liên kết** `googleId` và đánh dấu email đã xác nhận.

Trong `NODE_ENV=test`, token dạng `mock-google:email:name:sub` được chấp nhận để integration test.

## 6. handleAsync & error

```js
const { wrapController } = require('../../utils/handleAsync');
class FooController {
  async create(req, res) {
    const data = await fooService.create(req.body);
    return sendSuccess(res, 'OK', data, 201);
  }
}
module.exports = wrapController(new FooController());
```

Lớp lỗi: `AppError`, `BadRequestError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ServiceUnavailableError`.

`error.middleware.js` chuẩn hóa thêm: JWT hết hạn, Prisma `P2002`/`P2025`, JSON parse, Multer, Zod. `notFound.middleware.js` bắt route không tồn tại.

## 7. validBodyRequest

```js
router.post('/login', validBodyRequest(loginSchema), authController.login);
```

Schema là Zod object của **body** (không bọc `{ body: ... }`). Parse thành công thì `req.body` được gán data đã strip/default.

## 8. Frontend

- Axios `withCredentials: true`, không còn `localStorage.token`.
- 401 → tự `POST /auth/refresh-token` rồi retry.
- Trang: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/profile` (đổi mật khẩu).

## 9. Biến môi trường

Xem `backend/.env.example` và `frontend/.env.example`.

Người mới học luồng code (JWT, cookie, handleAsync, Zod): `docs/09-giai-thich-code-auth.md` (bản `docx/GIAI_THICH_LUONG_CODE_AUTH.md`) — chỉ tên file + sơ đồ, mở source trong repo.

Học từng buổi (file nào, vẽ gì, thử gì): `docs/11-lo-trinh-hoc-auth.md` (bản `docx/LO_TRINH_HOC_AUTH.md`).

Hướng dẫn cấu hình Google OAuth từng bước: `docs/10-huong-dan-oauth-google.md` (bản `docx/HUONG_DAN_OAUTH_GOOGLE.md`).
