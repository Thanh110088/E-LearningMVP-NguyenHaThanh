/**
 * Repository = tầng nói chuyện với Prisma/DB.
 * Service không viết prisma.user.findUnique trực tiếp — dễ test và đổi DB sau này.
 */
const prisma = require('../../config/prisma');

// Không select password khi trả profile ra ngoài
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
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId) {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

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

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async createEmailToken({ userId, tokenHash, type, expiresAt }) {
    return prisma.emailToken.create({
      data: { userId, tokenHash, type, expiresAt },
    });
  }

  async findEmailToken(tokenHash, type) {
    return prisma.emailToken.findFirst({
      where: { tokenHash, type, usedAt: null },
      include: { user: true },
    });
  }

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

  async createRefreshToken({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt, userAgent, ipAddress },
    });
  }

  async findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

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
