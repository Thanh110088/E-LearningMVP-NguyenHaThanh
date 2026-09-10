/**
 * Repository = tầng nói chuyện với Prisma/DB.
 * Service không viết prisma.user.findUnique trực tiếp — dễ test và đổi DB sau này.
 */
const prisma = require('../../config/prisma');

// Không select password khi trả profile ra ngoài (tránh lộ hash bcrypt)
const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  plan: true,
  isActive: true,
  emailVerified: true,
  provider: true,
  googleId: true,
  createdAt: true,
  updatedAt: true,
};

class AuthRepository {
  /** Tìm user theo email (kèm password hash — dùng login / quên MK). */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /** Tìm user đã liên kết Google theo `sub` (googleId). */
  async findByGoogleId(googleId) {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

  /** Lấy profile theo id, không kèm password. */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  /** Cần password hash để bcrypt.compare khi đổi mật khẩu */
  async findByIdWithPassword(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /** Tạo user mới (LOCAL hoặc GOOGLE). */
  async createUser(userData) {
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  /** Cập nhật user (verify email, đổi MK, gắn googleId...). */
  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  /** Lưu hash token gửi trong email (verify / reset). */
  async createEmailToken({ userId, tokenHash, type, expiresAt }) {
    return prisma.emailToken.create({
      data: { userId, tokenHash, type, expiresAt },
    });
  }

  /** Tìm token email còn chưa dùng (usedAt = null). */
  async findEmailToken(tokenHash, type) {
    return prisma.emailToken.findFirst({
      where: { tokenHash, type, usedAt: null },
      include: { user: true },
    });
  }

  /** Đánh dấu token đã dùng 1 lần — không click lại được. */
  async markEmailTokenUsed(id) {
    return prisma.emailToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /** Vô hiệu token verify/reset cũ khi gửi mail mới — chỉ 1 link còn sống */
  async invalidateEmailTokens(userId, type) {
    return prisma.emailToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  /** Lưu hash JWT refresh sau login / refresh (phục vụ rotation). */
  async createRefreshToken({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt, userAgent, ipAddress },
    });
  }

  /** Tìm phiên refresh theo hash, kèm user. */
  async findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  /** Thu hồi 1 refresh token (logout hoặc sau khi rotation). */
  async revokeRefreshToken(id) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /** Đổi/reset mật khẩu: đá hết phiên đăng nhập trên mọi máy */
  async revokeAllRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

module.exports = new AuthRepository();
