# HƯỚNG DẪN OAUTH GOOGLE TỪ A–Z (NGƯỜI MỚI)

Bản sao của `docs/10-huong-dan-oauth-google.md` — đặt trong thư mục `docx` để dễ tìm.

Tài liệu này gom **toàn bộ việc cần làm** để nút **Đăng nhập Google** chạy trên máy local. Viết cho người lần đầu đụng Google Cloud / OAuth.

Code OAuth **đã có sẵn** trong repo. Bạn chỉ cần cấu hình Google Cloud + file `.env`. Không phải viết lại hệ thống OAuth từ đầu.

---

## 1. OAuth trong project này là gì?

ETech **không** dùng kiểu OAuth cổ điển (redirect sang Google rồi về `/callback` + Client Secret).

Project dùng **Google Identity Services (GIS)**:

1. Trang web hiện nút Google.
2. Bạn chọn Gmail trên popup của **Google**.
3. Google trả một chuỗi gọi là **idToken** (JWT do Google ký).
4. Frontend gửi `POST /api/v1/auth/google` với `{ idToken }`.
5. Backend gọi Google để **verify** token, lấy `email`, `name`, `sub`.
6. Tạo hoặc liên kết user trong Postgres, set cookie đăng nhập.

| Cần | Không cần |
| :--- | :--- |
| OAuth **Client ID** (Web) | Client Secret |
| Authorized JavaScript origins | URL callback `/auth/google/callback` |
| Test user (khi app còn Testing) | App password Gmail |

Client ID trông như: `208885443423-xxxx.apps.googleusercontent.com`.

---

## 2. Sơ đồ luồng

```text
Bạn bấm "Đăng nhập Google" trên http://localhost:5173/login
        │
        ▼
Google hỏi: app này đang Testing? Email này có trong Test users?
        │
   KHÔNG ──► Google chặn. Backend ETech không chạy.
        │
   CÓ ──► Google trả idToken
        │
        ▼
Frontend POST /api/v1/auth/google { idToken }
        │
        ▼
Backend verifyIdToken (audience = GOOGLE_CLIENT_ID)
        │
        ▼
User chưa có  → tạo user provider=GOOGLE, emailVerified=true, set cookie
User email đã có (đăng ký mật khẩu) → gắn googleId, set cookie
```

**Không cần vào `/register` trước** khi dùng Google. Một lần bấm = tạo tài khoản (nếu mới) + đăng nhập.

Đăng ký **email + mật khẩu** là luồng khác: `/register` → xác nhận email → `/login`. Không liên quan Test user.

---

## 3. Chuẩn bị trước

- Tài khoản Gmail cá nhân (đúng Gmail bạn sẽ bấm nút).
- Máy đã chạy được app: `npm run dev` (frontend `5173`, backend `5050`).
- Mở app bằng **`http://localhost:5173`**, không dùng `http://127.0.0.1:5173` (Google coi là origin khác).

---

## 4. Google Cloud Console (từng bước)

### 4.1. Tạo / chọn project

1. Vào [Google Cloud Console](https://console.cloud.google.com/).
2. Thanh trên cùng → chọn project, hoặc **New project**.

### 4.2. OAuth consent screen

1. Menu **APIs & Services** → **OAuth consent screen** (giao diện mới đôi khi tên **Audience**).
2. User type: **External** (Gmail cá nhân).
3. Điền App name, email hỗ trợ, developer contact.
4. Scopes mặc định (`email`, `profile`, `openid`) là đủ.
5. Trạng thái **Testing**: chỉ những email trong **Test users** mới bấm được nút Google.

### 4.3. Test user là gì? (đọc kỹ)

**Test user = Gmail bạn sẽ dùng khi popup Google hiện ra.**  
Ví dụ bạn dùng `nguyenvana@gmail.com` → thêm đúng `nguyenvana@gmail.com`.

Không phải:

- `student@elearning.com` trong database ETech
- App password (trang Google Account → App passwords)
- Email hệ thống tự sinh

Cách thêm:

1. Cùng màn **OAuth consent screen** / **Audience**
2. Kéo tới **Test users** → **Add users**
3. Gõ Gmail của bạn → Save

Chủ project Cloud đôi khi tự được phép; thêm tay vẫn chắc hơn.

Khi app còn Testing, Google chặn **trước khi** request tới localhost. Thiếu Test user thì backend không tạo được user Google.

Muốn mọi Gmail bấm được: **Publish** consent screen (không bắt buộc khi chỉ học local).

### 4.4. Tạo OAuth Client ID

1. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**
2. Application type: **Web application**
3. **Authorized JavaScript origins** (bắt buộc với GIS):

   - `http://localhost:5173`

4. **Authorized redirect URIs** (Console thường bắt ít nhất 1 dòng):

   - `http://localhost:5173`

   Không cần `http://localhost:5050/api/v1/auth/google`.

5. Copy **Client ID**. Không cần Client Secret cho flow này.

Origin phải đúng `http` + `localhost` + cổng `5173`. Sai một ký tự là Google báo origin not allowed.

---

## 5. File `.env` (chỗ hay làm sai)

Node **chỉ đọc** `backend/.env`. File `backend/.env.example` là mẫu, **server không load**.

### 5.1. Backend — `backend/.env`

Thêm (cùng Client ID bạn copy):

```env
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

Không để dấu backtick thừa trong file `.env`.

### 5.2. Frontend — `frontend/.env`

Tạo file nếu chưa có:

```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_API_URL=
```

Hai Client ID **phải giống nhau**.

`VITE_API_URL` để trống: Vite proxy `/api` sang cổng 5050 (cookie dễ hơn). Nếu ghi `http://localhost:5050` thì vẫn được trên localhost, nhưng **phải mở** `http://localhost:5173` (không `127.0.0.1`).

Biến `VITE_*` chỉ nạp khi **khởi động lại** Vite. Sửa `.env` backend thì **restart API**.

Thiếu `VITE_GOOGLE_CLIENT_ID` → nút Google **ẩn**.  
Thiếu `GOOGLE_CLIENT_ID` ở backend → bấm Google rồi API trả khoảng **503**: *Đăng nhập Google chưa được cấu hình trên máy chủ*.

---

## 6. Dùng trên localhost

1. `npm run dev` (root repo).
2. Mở `http://localhost:5173/login`.
3. Thấy nút Google.
4. Bấm → chọn **đúng Gmail Test user**.
5. Thành công: vào trang chủ, header hiện tên.

Trong database bảng `users`:

- `provider = GOOGLE`
- `googleId` có giá trị
- `emailVerified = true`
- `password` có thể `null`

Lần sau bấm Google cùng Gmail: đăng nhập lại, không tạo user thứ hai.

Nếu Gmail đó **đã đăng ký mật khẩu** trước: hệ thống **liên kết** `googleId` vào user cũ.

---

## 7. Local và production (domain) khác nhau thế nào?

Học local **không cần VPS, không cần mua domain**.

“Production có domain” = user mở `https://domain-cua-ban`, không còn localhost. Google yêu cầu origin HTTPS cho người dùng thật.

| | Local | Production |
| :--- | :--- | :--- |
| URL | `http://localhost:5173` | `https://etech.vn` (ví dụ) |
| Cần VPS? | Không | Không bắt buộc. Có thể Vercel / Render / Railway, hoặc tự thuê VPS |

Cùng một Client ID có thể khai **cả hai** origin trên Console:

- `http://localhost:5173`
- `https://etech.vn`

Env production (khi đã deploy):

```env
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
CORS_ORIGIN="https://etech.vn"
FRONTEND_URL="https://etech.vn"
NODE_ENV=production
```

```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Repo có `vercel.json` (frontend + backend + rewrite `/api`). Đó là một cách lên internet, không phải cách duy nhất.

---

## 8. App password Gmail — đừng nhầm với OAuth

Trang Google Account → **App passwords** dùng để app gửi mail SMTP (`SMTP_USER` / `SMTP_PASS`).

| | Test user (OAuth) | App password |
| :--- | :--- | :--- |
| Việc | Cho Gmail nào **bấm Đăng nhập Google** khi app Testing | Cho Nodemailer gửi mail xác nhận / quên MK |
| Nơi cấu hình | Cloud Console → OAuth consent → Test users | Google Account → Security → App passwords |
| Cần cho nút Google? | Có (khi Testing) | Không |

Cấu hình SMTP là bước **riêng**. Nút Google chạy được **không cần** App password.

---

## 9. Lỗi thường gặp

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
| :--- | :--- | :--- |
| Không thấy nút Google | Thiếu `VITE_GOOGLE_CLIENT_ID` hoặc chưa restart Vite | Sửa `frontend/.env`, restart `npm run dev` |
| 503 chưa cấu hình trên máy chủ | Thiếu `GOOGLE_CLIENT_ID` trong `backend/.env` (gắn nhầm `.env.example`) | Sửa `backend/.env`, restart backend |
| `The given origin is not allowed` | Chưa khai `http://localhost:5173` hoặc đang mở `127.0.0.1` | Thêm origin; mở đúng localhost |
| Access blocked / 403 access_denied | App Testing, Gmail chưa là Test user | Add users trên consent screen |
| Token Google không hợp lệ | Client ID frontend ≠ backend | Hai file `.env` cùng một ID |
| Đăng ký mật khẩu được, Google không | Bình thường: mật khẩu không cần Console | Chỉ Google mới cần Test user + Client ID |

---

## 10. Checklist “đã xong chưa”

- [ ] Cloud: consent screen External + Testing
- [ ] Cloud: Test users = Gmail bạn sẽ bấm
- [ ] Cloud: Client ID Web, origin `http://localhost:5173`
- [ ] `backend/.env` có `GOOGLE_CLIENT_ID` (không phải chỉ `.env.example`)
- [ ] `frontend/.env` có `VITE_GOOGLE_CLIENT_ID` **cùng giá trị**
- [ ] Đã restart backend và frontend
- [ ] Mở `http://localhost:5173/login` (không dùng 127.0.0.1)
- [ ] Bấm Google, chọn đúng Gmail Test user, vào được trang chủ

---

## 11. Tên file liên quan

Không cần sửa các file này để bật OAuth — chỉ cần Console + `.env`. Mở file trong repo (đã có comment tiếng Việt). Không dán source vào đây.

| Việc | File |
| :--- | :--- |
| Nút Google | `frontend/src/features/auth/GoogleLoginButton.jsx` |
| Gắn nút vào trang | `LoginPage.jsx`, `RegisterPage.jsx` |
| Axios + cookie | `frontend/src/lib/axios.js` |
| Env backend | `backend/src/config/index.js` |
| Zod body `{ idToken }` | `backend/src/modules/auth/auth.schema.js` |
| Route `POST /google` | `backend/src/modules/auth/auth.routes.js` |
| Controller set cookie | `backend/src/modules/auth/auth.controller.js` |
| Verify Google | `backend/src/services/googleAuth.service.js` |
| Tạo / liên kết user | `backend/src/modules/auth/auth.service.js` (`loginWithGoogle`) |
| Cookie httpOnly | `backend/src/utils/cookie.util.js` |

Luồng code (register, login, Google, refresh, mail): `docs/09-giai-thich-code-auth.md` hoặc `docx/GIAI_THICH_LUONG_CODE_AUTH.md`.
API auth: `docs/08-auth-base.md`.
