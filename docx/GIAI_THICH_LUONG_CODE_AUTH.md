# Giải thích luồng code Auth (dành cho người mới)

Đọc tài liệu này **cùng file trong repo**. File nguồn đã có chú thích tiếng Việt phía trên khối logic — không copy code vào đây cho dễ đọc.

Bản trong `docs`: `docs/09-giai-thich-code-auth.md`.

> Các module khác (exam, question, workspace...) dùng **cùng khuôn**:  
> `routes` → `controller` → `service` → `repository`.  
> Hiểu auth xong là đọc được gần hết backend.

---

## 1. Request đi qua những lớp nào?

```text
Trình duyệt  →  Vite proxy /api  →  Express
                                    │
                    cors + cookieParser + json
                                    │
                    validBodyRequest (Zod)     ← nếu route có body
                    authenticate / authorize   ← nếu route cần login
                                    │
                    Controller  →  Service  →  Repository  →  PostgreSQL
                                    │
                    lỗi throw  →  handleAsync  →  error.middleware  → JSON
```

File ráp các lớp: `backend/src/app.js`.

---

## 2. Tên file liên quan (mở file này, đừng đọc code ở đây)

### Backend — module auth

| File | Việc |
| :--- | :--- |
| `backend/src/app.js` | Ráp middleware + mount `/api/v1/auth` |
| `backend/src/config/index.js` | Đọc `.env` (JWT, cookie, `GOOGLE_CLIENT_ID`, SMTP) |
| `backend/src/modules/auth/auth.routes.js` | URL nào gọi hàm nào |
| `backend/src/modules/auth/auth.schema.js` | Zod: body login / register / Google / mail |
| `backend/src/modules/auth/auth.controller.js` | Mỏng: gọi service, set cookie, trả JSON |
| `backend/src/modules/auth/auth.service.js` | Não bộ: login, Google, mail, refresh, logout |
| `backend/src/modules/auth/auth.repository.js` | Prisma: user, refresh token, email token |

### Backend — dùng chung

| File | Việc |
| :--- | :--- |
| `backend/src/utils/handleAsync.js` | Bọc controller: `throw` → error handler |
| `backend/src/utils/AppError.js` | Lỗi có `statusCode` (401, 403, 409...) |
| `backend/src/utils/token.util.js` | Ký / đọc JWT access + refresh |
| `backend/src/utils/cookie.util.js` | Set / xóa cookie `accessToken`, `refreshToken` |
| `backend/src/utils/response.util.js` | `sendSuccess` — JSON thống nhất |
| `backend/src/middlewares/validBodyRequest.js` | Validate body bằng Zod |
| `backend/src/middlewares/auth.middleware.js` | `authenticate` / `authorize` → `req.user` |
| `backend/src/middlewares/error.middleware.js` | JWT hết hạn, Prisma, Zod → JSON lỗi |
| `backend/src/middlewares/notFound.middleware.js` | Route không tồn tại → 404 |
| `backend/src/services/googleAuth.service.js` | `verifyIdToken` với Google |
| `backend/src/services/mail.service.js` | Gửi mail verify / quên MK / đổi MK |

### Frontend

| File | Việc |
| :--- | :--- |
| `frontend/src/lib/axios.js` | `withCredentials`, tự `POST /refresh-token` khi 401 |
| `frontend/src/features/auth/LoginPage.jsx` | Form mật khẩu + nút Google |
| `frontend/src/features/auth/RegisterPage.jsx` | Đăng ký LOCAL |
| `frontend/src/features/auth/GoogleLoginButton.jsx` | GIS: lấy `idToken`, `POST /auth/google` |
| `frontend/src/features/auth/VerifyEmailPage.jsx` | `/verify-email?token=` |
| `frontend/src/features/auth/ForgotPasswordPage.jsx` | Quên mật khẩu |
| `frontend/src/features/auth/ResetPasswordPage.jsx` | Đặt mật khẩu mới từ link mail |
| `frontend/src/features/auth/ProfilePage.jsx` | Đổi mật khẩu khi đã login |

Prisma schema user / token: `backend/prisma/schema.prisma` (model `User`, `RefreshToken`, `EmailToken`).

---

## 3. Từ điển khái niệm

| Khái niệm | Nghĩa đơn giản | File mở |
| :--- | :--- | :--- |
| **JWT** | Giấy thông hành có chữ ký. Server đọc `id/role` không hỏi DB mỗi lần (vẫn check `isActive`). | `token.util.js` |
| **accessToken** | JWT sống ngắn (~15 phút). Cookie `httpOnly`. | `cookie.util.js` |
| **refreshToken** | JWT sống dài (~7 ngày). Xin access mới. Hash lưu bảng `refresh_tokens`. | `auth.service.js` → `issueTokenPair` |
| **httpOnly cookie** | JS không đọc được token → giảm XSS. Trình duyệt tự gửi cookie. | `cookie.util.js` |
| **withCredentials** | Axios bắt buộc bật thì cookie mới đi kèm request. | `axios.js` |
| **handleAsync** | Bọc hàm async: throw → `next(err)` → error handler. | `handleAsync.js` |
| **Zod + validBodyRequest** | Kiểm tra JSON body trước khi vào controller. | `validBodyRequest.js` |
| **AppError** | Lỗi có `statusCode`. | `AppError.js` |
| **bcrypt** | Hash mật khẩu 1 chiều. Lưu hash, so sánh `bcrypt.compare`. | `auth.service.js` |
| **email token** | Chuỗi ngẫu nhiên trong link mail. DB chỉ lưu SHA-256. Dùng 1 lần. | `auth.service.js` → `createAndSendEmailToken` |
| **rotation** | Refresh xong: token cũ `revoked`, cấp token mới. Dùng 2 lần = lộ. | `auth.service.js` → `refreshToken` |
| **Google idToken** | JWT do **Google** ký. Backend verify, không tin client. | `googleAuth.service.js` |

---

## 4. Đọc file theo thứ tự

1. `backend/src/app.js`
2. `auth.routes.js`
3. `auth.schema.js`
4. `auth.controller.js`
5. `auth.service.js`
6. `auth.repository.js`
7. `auth.middleware.js`
8. `error.middleware.js`
9. `frontend/src/lib/axios.js`
10. Các trang `frontend/src/features/auth/*`

---

## 5. Các luồng (vẽ ra giấy khi học)

### Đăng ký + xác nhận mail

```text
POST /register { email, password, fullName }
  → hash password, emailVerified=false
  → mail link /verify-email?token=RAW
  → KHÔNG set cookie

User bấm link
  → POST /verify-email { token }
  → hash(token) khớp DB, usedAt = now, emailVerified=true
  → set cookie → vào được GET /auth/me
```

File: `RegisterPage.jsx` → `auth.service.js` (register + verify) → `mail.service.js` → `VerifyEmailPage.jsx`.

### Đăng nhập password

```text
POST /login
  → bcrypt.compare
  → chặn nếu khóa / chưa verify
  → JWT access + refresh, hash refresh vào DB
  → Set-Cookie

GET /exams (authenticate)
  → đọc cookie accessToken
  → jwt.verify + query user còn active
  → req.user
```

File: `LoginPage.jsx` → `auth.controller.js` → `auth.service.js` → `cookie.util.js` → sau đó `auth.middleware.js`.

### Đăng nhập Google

```text
Nút Google (GIS)
  → Google trả idToken (JWT do Google ký)
  → POST /auth/google { idToken }
  → verifyIdToken (audience = GOOGLE_CLIENT_ID)
  → tìm googleId / email
       có user LOCAL cùng email → gắn googleId
       chưa có → tạo user provider=GOOGLE, emailVerified=true
  → issueTokenPair + Set-Cookie
```

File: `GoogleLoginButton.jsx` → `googleAuth.service.js` → `auth.service.js` (`loginWithGoogle`) → `cookie.util.js`.

Cấu hình Console / `.env`: `docs/10-huong-dan-oauth-google.md`.

### Access hết hạn

```text
GET /me → 401 Token hết hạn
Axios interceptor → POST /refresh-token (cookie refresh)
  → revoke refresh cũ, cấp cặp mới, Set-Cookie
  → gọi lại GET /me
```

File: `axios.js` → `auth.service.js` (`refreshToken`).

### Quên / đặt lại mật khẩu

```text
POST /forgot-password { email }
  → luôn 200 (không lộ email có tồn tại)
  → nếu LOCAL + active → mail /reset-password?token=

POST /reset-password { token, newPassword }
  → hash token khớp DB
  → đổi password, revoke mọi refresh
  → mail cảnh báo đã đổi
```

File: `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `mail.service.js`.

### Đổi mật khẩu (đã login)

```text
POST /change-password { currentPassword, newPassword }
  → authenticate (cookie)
  → bcrypt mật khẩu cũ
  → revoke mọi refresh, cấp cookie mới
  → mail cảnh báo bảo mật
```

File: `ProfilePage.jsx` → `auth.service.js`.

---

## 6. Vì sao không lưu JWT trong localStorage?

Script độc (XSS) đọc được `localStorage`. Cookie `httpOnly` thì script không đọc được. CSRF giảm nhờ `SameSite=Lax` + frontend cùng site (hoặc proxy Vite).

---

## 7. Module khác đọc thế nào?

Ví dụ tạo đề thi:

`exam.routes.js` → `validBodyRequest(examSchema)` → `authenticate` → `authorize('TEACHER','ADMIN')` → `exam.controller.js` → `exam.service.js` → `exam.repository.js`.

Giống auth, chỉ khác nghiệp vụ.

---

## 8. Tài liệu kế bên

| File | Nội dung |
| :--- | :--- |
| `docs/08-auth-base.md` | API, cookie, email, biến môi trường |
| `docs/10-huong-dan-oauth-google.md` | Google Cloud + `.env` (không giải thích code) |
| `docs/11-lo-trinh-hoc-auth.md` | Học từng buổi: file nào, vẽ gì, thử gì |
| `docx/HUONG_DAN_OAUTH_GOOGLE.md` | Bản sao hướng dẫn OAuth |
