const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");
const config = require("../../config");

class AuthService {
  async register({ email, password, fullName, role }) {
    // TODO: Viết logic đăng ký (kiểm tra user tồn tại, hash password, tạo user, sinh token...)
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error("Email đã được sử dụng");
      error.statusCode = 400;
      throw error;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await authRepository.createUser({
      email,
      password: hashedPassword,
      fullName,
      role: role || "STUDENT",
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    }; //gói các dữ liệu này thành một object và trả về cho controller để controller trả về response cho client
  }

  async login({ email, password }) {
    // TODO: Viết logic đăng nhập (tìm user, check mật khẩu, check trạng thái, sinh token...)
    const user = await authRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Email hoặc mật khẩu không đúng");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("Tài khoản của bạn đã bị khóa");
      error.statusCode = 403;
      throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Email hoặc mật khẩu không đúng");
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
    return {
      user: userData,
      accessToken,
      refreshToken,
    }; //gói các dữ liệu này thành một object và trả về cho controller để controller trả về response cho client
  }

  async refreshToken(token) {
    // TODO: Viết logic làm mới token (verify refreshToken, tìm user, sinh cặp token mới...)
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret);
      const user = await authRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        const error = new Error("Tai khoan khong hop le");

        error.statusCode = 401;
        throw error;
      }
      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      const err = new Error("Refresh token không hợp lệ hoặc đã hết hạn");
      err.statusCode = 401;
      throw err;
    }
  }

  async getProfile(userId) {
    // TODO: Viết logic lấy thông tin cá nhân theo userId (kiểm tra user có tồn tại hay không...)
    const user = await authRepository.findById(userId);
    if (!user) {
      const error = new Error("Khong tim thay thong tin nguoi dung");
      error.statusCode = 404;
      throw error;
    }
    return user; //trả về thông tin user cho controller để controller trả về response cho client
  }

  generateAccessToken(user) {
    // TODO: Viết logic tạo Access Token sử dụng jwt.sign() tại đây
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    );
  }

  generateRefreshToken(user) {
    // TODO: Viết logic tạo Refresh Token sử dụng jwt.sign() tại đây
    return jwt.sign(
      {
        id: user.id,
      },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn },
    );
  }
}

module.exports = new AuthService();
