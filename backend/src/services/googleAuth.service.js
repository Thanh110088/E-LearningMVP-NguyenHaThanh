/**
 * Verify Google idToken (GIS). Test: token `mock-google:email:name:sub`.
 */
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
const { ServiceUnavailableError, UnauthorizedError } = require('../utils/AppError');

const client = config.googleClientId ? new OAuth2Client(config.googleClientId) : null;

/** Chỉ khi NODE_ENV=test: idToken dạng mock-google:email:name:sub — khỏi gọi Google thật */
const parseMockToken = (idToken) => {
  if (!config.isTest || !idToken?.startsWith('mock-google:')) return null;
  const [, email, fullName, sub] = idToken.split(':');
  if (!email) return null;
  return {
    email,
    name: fullName || email.split('@')[0],
    sub: sub || `google-${email}`,
    picture: null,
    email_verified: true,
  };
};

/** Gọi Google verifyIdToken; trả payload email, name, sub, picture. */
const verifyGoogleIdToken = async (idToken) => {
  const mock = parseMockToken(idToken);
  if (mock) return mock;

  if (!config.googleClientId || !client) {
    throw new ServiceUnavailableError('Đăng nhập Google chưa được cấu hình trên máy chủ');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId, // token phải được phát hành cho đúng Client ID của mình
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedError('Google không trả về email hợp lệ');
    }
    return payload;
  } catch (error) {
    if (error instanceof ServiceUnavailableError || error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Token Google không hợp lệ hoặc đã hết hạn');
  }
};

module.exports = {
  verifyGoogleIdToken,
};
