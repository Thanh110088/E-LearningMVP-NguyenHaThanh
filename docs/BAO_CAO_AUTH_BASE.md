# Báo cáo nâng cấp Auth-Base Node.js (ETech)

**Ngày:** 09/09/2026  
**Phạm vi:** toàn bộ backend auth + middleware + frontend phiên đăng nhập  
**Kết quả:** hệ thống xác thực cookie-based hoàn chỉnh (password, Google, xác nhận email).

---

## 1. Hiện trạng trước khi làm

Module auth cũ chỉ có:

- `POST /register`, `POST /login`, `POST /refresh-token`, `GET /me`
- JWT trả trong JSON body, frontend lưu `localStorage`
- Không Google, không xác nhận email, không quên/đổi mật khẩu
- Controller rải `try/catch` rồi `next(error)`
- Validate Zod chỉ auth, schema bọc `{ body }`
- Error handler chỉ lấy `statusCode` + `message`

## 2. Việc đã triển khai

### 2.1 Đăng nhập mật khẩu

- Hash bcrypt, chặn tài khoản khóa, chặn login khi **chưa xác nhận email**.
- Cấp `accessToken` + `refreshToken` qua cookie `httpOnly`.
- Refresh token **rotation**: hash lưu `refresh_tokens`, token cũ bị thu hồi khi refresh.

### 2.2 Đăng nhập Google

- `POST /api/v1/auth/google` nhận Google ID token, verify bằng `google-auth-library`.
- Tạo user `provider=GOOGLE` (không bắt buộc mật khẩu) hoặc liên kết email LOCAL sẵn có.
- Email Google được coi là đã xác nhận.
- UI: nút Google Identity Services trên Login/Register (ẩn nếu chưa có `VITE_GOOGLE_CLIENT_ID`).

### 2.3 Xác thực email

| Tình huống | Cách làm |
| :--- | :--- |
| **Đăng ký mới** | User `emailVerified=false`, gửi mail chứa token. Login bị 403 `EMAIL_NOT_VERIFIED` cho đến khi `POST /verify-email`. |
| **Quên mật khẩu** | `POST /forgot-password` luôn 200; nếu user LOCAL tồn tại thì gửi link `/reset-password?token=`. |
| **Đổi mật khẩu** | `POST /change-password` (đã login) hoặc sau reset: gửi **email cảnh báo bảo mật** (thời điểm + IP). Revoke toàn bộ refresh token. |

Token email: 32 bytes hex, lưu SHA-256, TTL 24h (verify) / 15m (reset). SMTP thiếu thì log + outbox (test đọc được).

### 2.4 Cookie

- `cookie-parser`, CORS `credentials: true`.
- Frontend Axios `withCredentials`, Vite proxy `cookieDomainRewrite`.
- Logout xóa cookie + revoke refresh token hiện tại.
- Middleware `authenticate` đọc cookie trước, fallback Bearer.

### 2.5 handleAsync

- `backend/src/utils/handleAsync.js`: `handleAsync` + `wrapController`.
- Toàn bộ controller module (auth, exam, question, submission, admin, …) **bỏ try/catch**.
- `authenticate` cũng bọc `handleAsync`.

### 2.6 Error handler

- Lớp lỗi `AppError` và các subclass HTTP.
- 404 route, JWT, Prisma unique/not found, JSON invalid, Multer, Zod, extra field (`requiresPassword`, `examStartTime`, `code`).
- Production ẩn stack và message 500.

### 2.7 validBodyRequest + Zod

- Middleware `validBodyRequest(schema)` cho body.
- Gắn vào mọi POST/PUT có payload: auth, category, exam, question, workspace, admin, subscription, live, submission.

## 3. Schema CSDL bổ sung

- `User`: `password` optional, `googleId`, `provider`, `emailVerified`, `emailVerifiedAt`, `passwordChangedAt`
- `RefreshToken`, `EmailToken` (cascade khi xóa user)
- Seed tài khoản mẫu `emailVerified=true`

## 4. Frontend

- Bỏ token `localStorage`.
- Trang xác nhận email, quên MK, đặt lại MK, hồ sơ đổi MK.
- Session: `GET /auth/me` bằng cookie; logout gọi API.

## 5. Kiểm thử

File `backend/tests/auth.test.js` cover:

- Zod 400, đăng ký + mail, chặn login chưa verify, verify + cookie `/me`
- Email trùng 409, login sai MK, refresh cookie, forgot/reset, change-password + mail
- Google mock token, logout, 404

Các test admin / workspace / submission / dashboard chuyển sang `supertest` **agent** (cookie jar).

Chạy: `npm test` (từ root, workspace backend).

**Kết quả lần chạy 09/09/2026:** `5 test suites passed`, `36 tests passed`.

## 6. Cách chạy sau nâng cấp

```bash
# Cập nhật schema
npm run db:push
npm run seed

# Cấu hình Google / SMTP (tuỳ chọn) trong backend/.env và frontend/.env
npm run dev
```

Tài khoản seed vẫn dùng được ngay (đã verify sẵn). User đăng ký mới phải xác nhận email.

## 7. Rủi ro & lưu ý vận hành

- Production bắt buộc HTTPS (`cookieSecure=true` khi `NODE_ENV=production`).
- Cần `FRONTEND_URL` đúng để link trong email click được.
- Google: thêm origin production vào Google Cloud Console.
- Access token ngắn (khuyến nghị 15m). Nếu `.env` cũ còn `JWT_EXPIRES_IN=1d`, cookie access sẽ sống 1 ngày — nên đổi thành `15m`.
- Guest vào app vẫn gọi `/auth/me` (401) rồi thử refresh; đây là hành vi kiểm tra session.

## 8. File chính

| Nhóm | Đường dẫn |
| :--- | :--- |
| Auth service/API | `backend/src/modules/auth/*` |
| Cookie / token | `backend/src/utils/cookie.util.js`, `token.util.js` |
| Mail / Google | `backend/src/services/mail.service.js`, `googleAuth.service.js` |
| Errors / async | `backend/src/utils/AppError.js`, `handleAsync.js` |
| Middlewares | `validBodyRequest.js`, `error.middleware.js`, `notFound.middleware.js`, `auth.middleware.js` |
| Docs kỹ thuật | `docs/08-auth-base.md` |
