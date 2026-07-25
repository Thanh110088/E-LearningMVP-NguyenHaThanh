const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const config = require('../../config');

class AuthService {
  async register({ email, password, fullName, role }) {
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email đã được đăng ký trong hệ thống');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await authRepository.createUser({
      email,
      password: hashedPassword,
      fullName,
      role: role || 'STUDENT',
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Email hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Tài khoản đã bị khóa');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Email hoặc mật khẩu không chính xác');
      error.statusCode = 401;
      throw error;
    }

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(userData);
    const refreshToken = this.generateRefreshToken(userData);

    return { user: userData, accessToken, refreshToken };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret);
      const user = await authRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        const error = new Error('Người dùng không hợp lệ');
        error.statusCode = 401;
        throw error;
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      const err = new Error('Refresh Token không hợp lệ hoặc đã hết hạn');
      err.statusCode = 401;
      throw err;
    }
  }

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy thông tin người dùng');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );
  }
}

module.exports = new AuthService();
