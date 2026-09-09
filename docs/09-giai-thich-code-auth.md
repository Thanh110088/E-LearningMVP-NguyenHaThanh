# 09. Giải thích code Auth (dành cho người mới)

Tài liệu này đọc **cùng với comment trong file**. Mỗi khái niệm trỏ đúng chỗ trong repo.

> Các module khác (exam, question, workspace...) dùng **cùng một khuôn**:  
> `routes` → `controller` (handleAsync) → `service` (nghiệp vụ) → `repository` (Prisma).  
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

## 2. Từ điển khái niệm

| Khái niệm | Nghĩa đơn giản | File |
| :--- | :--- | :--- |
| **JWT** | Giấy thông hành có chữ ký. Server đọc được `id/role` mà không hỏi DB mỗi lần (vẫn check `isActive`). | `utils/token.util.js` |
| **accessToken** | JWT sống ngắn (15 phút). Cookie `httpOnly`. | `cookie.util.js` |
| **refreshToken** | JWT sống dài (7 ngày). Dùng để xin access mới. Hash lưu bảng `refresh_tokens`. | `auth.service.js` → `issueTokenPair` |
| **httpOnly cookie** | JS không đọc được token → giảm XSS. Trình duyệt tự gửi cookie. | `cookie.util.js` |
| **withCredentials** | Axios bắt buộc bật thì cookie mới đi kèm request. | `frontend/src/lib/axios.js` |
| **handleAsync** | Bọc hàm async: throw → `next(err)` → error handler. | `utils/handleAsync.js` |
| **Zod + validBodyRequest** | Kiểm tra JSON body trước khi vào controller. | `middlewares/validBodyRequest.js` |
| **AppError** | Lỗi có `statusCode` (401, 403, 409...). | `utils/AppError.js` |
| **bcrypt** | Hash mật khẩu 1 chiều. Lưu hash, so sánh bằng `bcrypt.compare`. | `auth.service.js` |
| **email token** | Chuỗi ngẫu nhiên trong link mail. DB chỉ lưu SHA-256. Dùng 1 lần. | `auth.service.js` → `createAndSendEmailToken` |
| **rotation** | Refresh xong: token cũ `revoked`, cấp token mới. Token bị đánh cắp dùng 2 lần sẽ lộ. | `refreshToken()` |
| **Google idToken** | JWT do **Google** ký. Backend `verifyIdToken`, không tin client. | `googleAuth.service.js` |

---

## 3. Đọc file theo thứ tự gợi ý

1. `backend/src/app.js` — thứ tự middleware  
2. `backend/src/modules/auth/auth.routes.js` — URL nào chạy hàm nào  
3. `auth.schema.js` — Zod trông như thế nào  
4. `auth.controller.js` — mỏng, set cookie  
5. `auth.service.js` — não bộ (login, mail, Google)  
6. `auth.repository.js` — Prisma  
7. `middlewares/auth.middleware.js` — `req.user`  
8. `middlewares/error.middleware.js` — JSON lỗi  
9. `frontend/src/lib/axios.js` — cookie + tự refresh  
10. Các trang `frontend/src/features/auth/*`

---

## 4. Ba luồng nên vẽ ra giấy

### Đăng ký + xác nhận mail

```text
POST /register { email, password, fullName }
  → hash password, emailVerified=false
  → mail link /verify-email?token=RAW
  → KHÔNG set cookie

User bấm link
  → POST /verify-email { token }
  → hash(token) khớp DB, usedAt = now, emailVerified=true
  → set cookie → vào được /auth/me
```

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

### Access hết hạn

```text
GET /me → 401 Token hết hạn
Axios interceptor → POST /refresh-token (cookie refresh)
  → revoke refresh cũ, cấp cặp mới, Set-Cookie
  → gọi lại GET /me
```

---

## 5. Vì sao không lưu JWT trong localStorage?

Script độc (XSS) đọc được `localStorage`. Cookie `httpOnly` thì script không đọc được. CSRF giảm nhờ `SameSite=Lax` + frontend cùng site (hoặc proxy Vite).

---

## 6. Module khác đọc thế nào?

Ví dụ tạo đề thi:

`exam.routes.js` → `validBodyRequest(examSchema)` → `authenticate` → `authorize('TEACHER','ADMIN')` → `exam.controller.js` (handleAsync) → `exam.service.js` → `exam.repository.js`.

Giống auth, chỉ khác nghiệp vụ.

---

## 7. Comment nằm ở đâu?

Mọi file auth-base đã có chú thích tiếng Việt **phía trên khối logic**, không comment từng dòng `const x = 1`. Mở file là đọc được ý định.
