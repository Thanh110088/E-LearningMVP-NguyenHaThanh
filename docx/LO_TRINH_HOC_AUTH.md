# LỘ TRÌNH HỌC AUTH (TỪNG BUỔI)

Bản sao của `docs/11-lo-trinh-hoc-auth.md` — đặt trong `docx` để dễ tìm.

Auth khó vì **nhiều khái niệm chồng lên nhau**. Không đọc hết `auth.service.js` một lần.

Mỗi buổi = **1 luồng**. Vẽ giấy → mở đúng vài file (đọc comment phía trên hàm) → bấm thật trên app.

Bản đồ khái niệm (không phải bài tập): `docs/09-giai-thich-code-auth.md` hoặc `docx/GIAI_THICH_LUONG_CODE_AUTH.md`.

Tài khoản seed (đã `emailVerified=true`, login được ngay):

| Email | Mật khẩu |
| :--- | :--- |
| `student@elearning.com` | `Student123456` |
| `teacher@elearning.com` | `Teacher123456` |
| `admin@elearning.com` | `Admin123456` |

Mở app: `http://localhost:5173` (không dùng `127.0.0.1`).

Khuôn lặp lại mọi module (học 1 lần, dùng mãi):

```text
routes → schema (Zod) → controller → service → repository → Postgres
```

---

## Buổi 1 — Bản đồ, chưa nghiệp vụ

**Mục tiêu:** biết request đi đâu. Chưa cần hiểu JWT.

### Đọc (thứ tự)

1. Mục 1–2 của `docs/09-giai-thich-code-auth.md`.
2. `backend/src/modules/auth/auth.routes.js` — 11 dòng `router.*`. Đây là **mục lục**. URL đầy đủ = `/api/v1/auth` + path đó.
3. `backend/src/app.js`:
   - middleware: `cors` → `cookieParser` → `json`
   - dòng `app.use('/api/v1/auth', authRoutes)`
4. `backend/prisma/schema.prisma` — chỉ 3 bảng: `User`, `RefreshToken`, `EmailToken` (comment bên phải field).

### Bài tập (nói được là xong)

- POST `/login` gọi hàm nào trong controller? → `authController.login`
- GET `/me` khác `/login` chỗ nào trên route? → có `authenticate` (cần cookie)
- Cookie refresh lưu **cột nào** trên DB? → `refresh_tokens.tokenHash` (không lưu JWT gốc)

Đừng mở `auth.service.js` buổi này.

---

## Buổi 2 — Login mật khẩu + cookie + GET /me

**Mục tiêu:** cookie, bcrypt, JWT access. Đây là luồng xương sống.

Vẽ giấy:

```text
LoginPage → POST /api/v1/auth/login → Zod loginSchema
  → AuthController.login
  → AuthService.login (bcrypt.compare)
  → issueTokenPair (JWT + hash refresh vào DB)
  → setAuthCookies
  → GET /auth/me (authenticate đọc cookie)
```

### Đọc (chỉ các hàm này)

1. `frontend/src/features/auth/LoginPage.jsx` — `handleSubmit` (`POST /auth/login`)
2. `backend/src/modules/auth/auth.schema.js` — `loginSchema`
3. `backend/src/modules/auth/auth.controller.js` — `login` (set cookie, body chỉ trả `user`)
4. `backend/src/modules/auth/auth.service.js` — `login` rồi `issueTokenPair`
5. `backend/src/modules/auth/auth.repository.js` — `findByEmail`, `createRefreshToken`
6. `backend/src/utils/cookie.util.js` — `setAuthCookies`
7. `backend/src/middlewares/auth.middleware.js` — `authenticate`
8. `frontend/src/App.jsx` — `checkAuth` (`GET /auth/me` khi F5)

### Thử

1. Login `student@elearning.com` / `Student123456`.
2. DevTools → Application → Cookies (`localhost:5173` hoặc `localhost:5050` tùy proxy): `accessToken`, `refreshToken`. `httpOnly` = JS không đọc được.
3. F5: vẫn còn tên user vì `checkAuth` gọi `/me`, cookie tự đi kèm (`withCredentials`).
4. Sai mật khẩu → JSON 401, không set cookie.

Breakpoint (VS Code): `AuthController.login` và `AuthService.login`, F11 một lần login.

---

## Buổi 3 — Đăng ký + mail + verify-email

**Mục tiêu:** register **không** set cookie. Verify xong **mới** login.

Vẽ giấy:

```text
RegisterPage → POST /register
  → hash password, emailVerified=false
  → createAndSendEmailToken (DB lưu HASH, mail chứa token GỐC)
  → KHÔNG cookie

User mở /verify-email?token=RAW
  → POST /verify-email
  → consumeEmailToken (hash khớp, usedAt)
  → emailVerified=true + set cookie
```

### Đọc

1. `frontend/src/features/auth/RegisterPage.jsx` — `handleSubmit`
2. `auth.controller.js` — `register` (không gọi `setAuthCookies`)
3. `auth.service.js` — `register`, `createAndSendEmailToken`, `consumeEmailToken`, `verifyEmail`
4. `auth.repository.js` — `createUser`, `createEmailToken`, `findEmailToken`, `markEmailTokenUsed`
5. `backend/src/services/mail.service.js` — `sendTemplate` / template `verifyEmail`
6. `frontend/src/features/auth/VerifyEmailPage.jsx`

Seed `student@...` **đã verify** — buổi này đăng ký **email mới** (chưa có trong DB).

### Thử

1. `/register` với email mới. API 201, trang hiện “kiểm tra email”. Chưa vào được hệ thống.
2. Dev: chưa SMTP thì mail ghi log + `outbox` trong RAM. Terminal backend có dòng `[MAIL:...]`. Link dạng `http://localhost:5173/verify-email?token=...`
3. Mở link → cookie xuất hiện, vào trang chủ.
4. Bảng `email_tokens`: `usedAt` khác null sau khi bấm link. Bấm lần 2 → lỗi token đã dùng.

Quên mật khẩu cùng khuôn (`forgotPassword` / `RESET_PASSWORD`) — học thêm nếu còn sức, không bắt buộc buổi này.

---

## Buổi 4 — Access hết hạn + refresh rotation

**Mục tiêu:** access sống ngắn; refresh xin cặp mới; token cũ chết.

Vẽ giấy:

```text
GET /me → 401 (access hết hạn)
  → axios interceptor
  → POST /auth/refresh-token (cookie refresh)
  → revoke refresh cũ, issueTokenPair mới, Set-Cookie
  → gọi lại GET /me
```

### Đọc

1. `frontend/src/lib/axios.js` — `withCredentials`, nhánh 401, `AUTH_SKIP_REFRESH` (không refresh khi đang login)
2. `auth.controller.js` — `refreshToken`
3. `auth.service.js` — `refreshToken` (rotation: `revokeRefreshToken` rồi `issueTokenPair`)
4. `auth.repository.js` — `findRefreshToken`, `revokeRefreshToken`

Mặc định access ~ **15 phút** (`JWT_EXPIRES_IN`). Không cần đợi 15 phút: đọc code là đủ. Muốn thấy 401 thật: tạm set `JWT_EXPIRES_IN=10s` trong `backend/.env`, restart API, login, đợi >10s, F5 — Network thấy `/refresh-token` rồi `/me` lại 200. **Nhớ đổi lại 15m** sau khi thử.

### Chốt

- Rotation = dùng refresh một lần là `revokedAt` được ghi. Dùng lại token cũ → 401.
- Logout: `revokeRefreshToken` + `clearAuthCookies`.

---

## Buổi 5 — Google (cùng khuôn login, khác cửa vào)

**Mục tiêu:** bước 1 khác (idToken), sau đó **giống buổi 2** (`issueTokenPair` + cookie).

Vẽ giấy:

```text
Nút GIS → Google trả idToken
  → POST /auth/google { idToken }
  → verifyGoogleIdToken
  → tìm googleId / email (tạo mới hoặc gắn vào LOCAL)
  → issueTokenPair + Set-Cookie
```

### Đọc

1. `frontend/src/features/auth/GoogleLoginButton.jsx` — `handleCredential`
2. `auth.controller.js` — `googleLogin`
3. `auth.service.js` — `loginWithGoogle`
4. `backend/src/services/googleAuth.service.js` — `verifyGoogleIdToken`

Cấu hình Console / `.env`: `docs/10-huong-dan-oauth-google.md`. Học **sau** khi đã rõ login mật khẩu.

Không cần `/register` trước khi bấm Google. Email LOCAL trùng → hệ thống **gắn `googleId`**, không tạo user thứ hai.

---

## Cách đọc cho đỡ rối

- Trong `auth.service.js` / `auth.repository.js`: đọc **comment phía trên hàm đang học**, bỏ qua hàm khác.
- Breakpoint tại controller + service của **đúng 1 endpoint**.
- Xong 5 buổi: module exam/question cùng khuôn `routes → controller → service → repository`.

## Tài liệu kế bên

| File | Khi nào mở |
| :--- | :--- |
| `docs/09-giai-thich-code-auth.md` | Từ điển JWT / cookie / Zod |
| `docs/08-auth-base.md` | Bảng API |
| `docs/10-huong-dan-oauth-google.md` | Google Cloud (buổi 5) |
