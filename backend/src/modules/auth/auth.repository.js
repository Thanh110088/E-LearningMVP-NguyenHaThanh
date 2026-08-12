const prisma = require("../../config/prisma");

class AuthRepository {
  async findByEmail(email) {
    // TODO: Viết logic tìm user theo email tại đây
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(userData) {
    // TODO: Viết logic tạo user mới (nhớ truyền data và select kết quả trả về) tại đây
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}

module.exports = new AuthRepository();
