/**
 * Cookie auth: trình duyệt tự gửi cookie mỗi request, JS frontend KHÔNG đọc được token
 * vì httpOnly = true → giảm rủi ro XSS (malicious script không steal được JWT).
 *
 * accessToken  — JWT ngắn hạn, dùng cho authenticate
 * refreshToken — JWT dài hạn, chỉ dùng để xin cặp token mới
 */
const config = require("../config");

/** Tùy chọn cookie chung: httpOnly, secure (prod), SameSite, path=/ */
const baseCookieOptions = () => ({
  httpOnly: true, // JS không đọc document.cookie cho 2 token này
  secure: config.cookieSecure, // production: chỉ gửi qua HTTPS
  sameSite: config.cookieSameSite, // Lax: chống CSRF cơ bản với request cross-site
  path: "/", // cookie có hiệu lực toàn site
});

/** Gắn 2 cookie sau login / verify / refresh / đổi MK. */
const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, {
    ...baseCookieOptions(),
    maxAge: config.accessTokenMaxAgeMs,
  });
  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions(),
    maxAge: config.refreshTokenMaxAgeMs,
  });
};

/** Xóa 2 cookie auth (logout / sau reset MK). */
const clearAuthCookies = (res) => {
  const options = baseCookieOptions();
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

/** Ưu tiên cookie; fallback Bearer cho Postman / test cũ */
const readAccessToken = (req) => {
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

/** Lấy refresh từ cookie, fallback body (Postman). */
const readRefreshToken = (req) =>
  req.cookies?.refreshToken || req.body?.refreshToken || null;

module.exports = {
  setAuthCookies,
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
};
