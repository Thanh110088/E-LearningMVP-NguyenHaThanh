/**
 * Token helpers
 *
 * JWT (JSON Web Token): chuỗi 3 phần header.payload.signature, ký bằng secret.
 * Server verify chữ ký → tin payload (id, email, role) mà không cần query DB mỗi lần
 * (authenticate vẫn query DB để kiểm tra isActive / bị khóa).
 *
 * Email token / refresh token lưu HASH (SHA-256) trên DB:
 * nếu DB bị lộ, kẻ tấn công không dùng được token gốc trong email/cookie.
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

/** Chuỗi ngẫu nhiên hex. 32 bytes → 64 ký tự, đưa vào link email. */
const generateRawToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const generateAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

/**
 * jti (JWT ID) ngẫu nhiên: 2 refresh token cấp trong cùng 1 giây sẽ khác nhau.
 * Nếu không có jti, jwt.sign cùng payload + cùng giây → hash trùng → lỗi unique DB.
 */
const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, typ: 'refresh', jti: generateRawToken(16) },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );

const verifyAccessToken = (token) => jwt.verify(token, config.jwtSecret);

const verifyRefreshToken = (token) => jwt.verify(token, config.jwtRefreshSecret);

const addMs = (ms) => new Date(Date.now() + ms);

module.exports = {
  hashToken,
  generateRawToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  addMs,
};
