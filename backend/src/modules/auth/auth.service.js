/**
 * AuthService = nghiệp vụ: hash mật khẩu, gửi mail, cấp JWT, Google, rotation...
 * Controller chỉ gọi các hàm này. Throw AppError, không bắt try/catch ở đây
 * (trừ chỗ jwt.verify vì thư viện throw lỗi không phải AppError).
 */
const bcrypt = require('bcryptjs');
const authRepository = require('./auth.repository');
const mailService = require('../../services/mail.service');
const { verifyGoogleIdToken } = require('../../services/googleAuth.service');
const config = require('../../config');
const {
  generateRawToken,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  addMs,
} = require('../../utils/token.util');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../../utils/AppError');

const SALT_ROUNDS = 10; // số vòng bcrypt; càng cao càng chậm brute-force, 10 là mức phổ biến

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl || null,
  role: user.role,
  plan: user.plan || 'FREE',
  isActive: user.isActive,
  emailVerified: user.emailVerified,
  provider: user.provider,
});

class AuthService {
  /** Tạo JWT + lưu HASH refresh token (rotation bắt đầu từ đây) */
  async issueTokenPair(user, meta = {}) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: addMs(config.refreshTokenMaxAgeMs),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });
    return { accessToken, refreshToken };
  }

  /** Tạo token ngẫu nhiên, lưu hash, gửi link chứa token GỐC qua email */
  async createAndSendEmailToken(user, type, extra = {}) {
    await authRepository.invalidateEmailTokens(user.id, type);
    const rawToken = generateRawToken();
    const ttl = type === 'RESET_PASSWORD' ? config.emailTokenTtl.resetMs : config.emailTokenTtl.verifyMs;
    await authRepository.createEmailToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      type,
      expiresAt: addMs(ttl),
    });

    if (type === 'VERIFY_EMAIL') {
      const verifyUrl = `${config.frontendUrl}/verify-email?token=${rawToken}`;
      await mailService.sendTemplate('verifyEmail', user.email, {
        fullName: user.fullName,
        verifyUrl,
      });
    }

    if (type === 'RESET_PASSWORD') {
      const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;
      await mailService.sendTemplate('resetPassword', user.email, {
        fullName: user.fullName,
        resetUrl,
      });
    }

    return { rawToken, ...extra };
  }

  /** Hash token client gửi lên rồi đối chiếu DB, đánh dấu usedAt (dùng 1 lần) */
  async consumeEmailToken(rawToken, type) {
    if (!rawToken) {
      throw new BadRequestError('Token xác thực là bắt buộc');
    }
    const record = await authRepository.findEmailToken(hashToken(rawToken), type);
    if (!record) {
      throw new BadRequestError('Token không hợp lệ hoặc đã được sử dụng');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError('Token đã hết hạn, vui lòng yêu cầu lại');
    }
    await authRepository.markEmailTokenUsed(record.id);
    return record.user;
  }

  async register({ email, password, fullName, role }, meta = {}) {
    const existingUser = await authRepository.findByEmail(email.toLowerCase());
    if (existingUser) {
      throw new ConflictError('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await authRepository.createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role: role || 'STUDENT',
      provider: 'LOCAL',
      emailVerified: false,
    });

    await this.createAndSendEmailToken(user, 'VERIFY_EMAIL');

    return {
      user: toPublicUser(user),
      requiresEmailVerification: true,
      meta,
    };
  }

  async login({ email, password }, meta = {}) {
    const user = await authRepository.findByEmail(email.toLowerCase());
    if (!user || !user.password) {
      // Google-only user không có password — trả cùng câu với sai MK để không lộ "email này dùng Google"
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    if (!user.emailVerified) {
      throw new ForbiddenError('Vui lòng xác nhận email trước khi đăng nhập', {
        code: 'EMAIL_NOT_VERIFIED', // frontend LoginPage đọc code này để hiện nút gửi lại mail
      });
    }

    const tokens = await this.issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  }

  async loginWithGoogle(idToken, meta = {}) {
    const payload = await verifyGoogleIdToken(idToken);
    const email = payload.email.toLowerCase();
    const googleId = payload.sub; // ID ổn định Google cấp cho tài khoản
    const fullName = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || null;

    let user = await authRepository.findByGoogleId(googleId);

    if (!user) {
      user = await authRepository.findByEmail(email);
      if (user) {
        // Email đã đăng ký LOCAL → liên kết Google, khỏi tạo user thứ 2
        if (!user.isActive) {
          throw new ForbiddenError('Tài khoản của bạn đã bị khóa');
        }
        user = await authRepository.updateUser(user.id, {
          googleId,
          avatarUrl: user.avatarUrl || avatarUrl,
          emailVerified: true,
          emailVerifiedAt: user.emailVerifiedAt || new Date(),
        });
      } else {
        user = await authRepository.createUser({
          email,
          password: null,
          fullName,
          avatarUrl,
          googleId,
          provider: 'GOOGLE',
          emailVerified: true,
          emailVerifiedAt: new Date(),
          role: 'STUDENT',
        });
      }
    }

    if (!user.isActive) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa');
    }

    const tokens = await this.issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  }

  async verifyEmail(token, meta = {}) {
    const user = await this.consumeEmailToken(token, 'VERIFY_EMAIL');
    if (!user.isActive) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa');
    }

    const updated = await authRepository.updateUser(user.id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    const tokens = await this.issueTokenPair(updated, meta);
    return { user: toPublicUser(updated), ...tokens };
  }

  async resendVerification(email) {
    const user = await authRepository.findByEmail(email.toLowerCase());
    if (!user || user.emailVerified) {
      return { sent: true }; // không tiết lộ user có tồn tại / đã verify chưa
    }
    await this.createAndSendEmailToken(user, 'VERIFY_EMAIL');
    return { sent: true };
  }

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email.toLowerCase());
    if (user && user.isActive && user.password) {
      await this.createAndSendEmailToken(user, 'RESET_PASSWORD');
    }
    return { sent: true }; // luôn "thành công" với client
  }

  async resetPassword({ token, newPassword }, meta = {}) {
    const user = await this.consumeEmailToken(token, 'RESET_PASSWORD');
    if (!user.isActive) {
      throw new ForbiddenError('Tài khoản của bạn đã bị khóa');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.revokeAllRefreshTokens(user.id);
    const updated = await authRepository.updateUser(user.id, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      emailVerified: true,
      emailVerifiedAt: user.emailVerifiedAt || new Date(),
    });

    await this.notifyPasswordChanged(updated, meta);
    return { user: toPublicUser(updated) };
  }

  async changePassword(userId, { currentPassword, newPassword }, meta = {}) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy thông tin người dùng');
    }
    if (!user.password) {
      throw new BadRequestError('Tài khoản Google chưa có mật khẩu. Hãy dùng quên mật khẩu để tạo mật khẩu mới.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Mật khẩu hiện tại không đúng');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.revokeAllRefreshTokens(userId);
    const updated = await authRepository.updateUser(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });

    await this.notifyPasswordChanged(updated, meta);
    const tokens = await this.issueTokenPair(updated, meta);
    return { user: toPublicUser(updated), ...tokens };
  }

  async notifyPasswordChanged(user, meta = {}) {
    const changedAt = new Date().toLocaleString('vi-VN');
    await mailService.sendTemplate('passwordChanged', user.email, {
      fullName: user.fullName,
      changedAt,
      ipAddress: meta.ipAddress,
    });
  }

  async refreshToken(rawToken, meta = {}) {
    if (!rawToken) {
      throw new UnauthorizedError('Refresh token không tồn tại');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawToken);
    } catch (error) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const stored = await authRepository.findRefreshToken(hashToken(rawToken));
    if (!stored || stored.revokedAt) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = stored.user;
    if (!user || !user.isActive || user.id !== decoded.id) {
      throw new UnauthorizedError('Tài khoản không hợp lệ');
    }

    await authRepository.revokeRefreshToken(stored.id); // rotation: token vừa dùng chết ngay
    const tokens = await this.issueTokenPair(user, meta);
    return { user: toPublicUser(user), ...tokens };
  }

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const stored = await authRepository.findRefreshToken(hashToken(rawRefreshToken));
      if (stored && !stored.revokedAt) {
        await authRepository.revokeRefreshToken(stored.id);
      }
    }
    return { loggedOut: true };
  }

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy thông tin người dùng');
    }
    return toPublicUser(user);
  }
}

module.exports = new AuthService();
