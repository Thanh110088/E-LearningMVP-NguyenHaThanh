require('dotenv').config(); // đọc file backend/.env vào process.env

/** Đổi chuỗi "15m", "7d" thành mili-giây để set maxAge cookie */
const parseDuration = (value, fallbackMs) => {
  if (!value) return fallbackMs;
  const match = String(value).trim().match(/^(\d+)\s*(ms|s|m|h|d)$/i);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * multipliers[unit];
};

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

module.exports = {
  port: process.env.PORT || 5050,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  jwtExpiresIn,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtRefreshExpiresIn,
  accessTokenMaxAgeMs: parseDuration(jwtExpiresIn, 15 * 60 * 1000),
  refreshTokenMaxAgeMs: parseDuration(jwtRefreshExpiresIn, 7 * 24 * 60 * 60 * 1000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173', // link trong email
  cookieSecure: nodeEnv === 'production',
  cookieSameSite: nodeEnv === 'production' ? 'lax' : 'lax',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'ETech <noreply@elearning.local>',
  },
  emailTokenTtl: {
    verifyMs: parseDuration(process.env.EMAIL_VERIFY_EXPIRES_IN || '24h', 24 * 60 * 60 * 1000),
    resetMs: parseDuration(process.env.PASSWORD_RESET_EXPIRES_IN || '15m', 15 * 60 * 1000),
  },
};
