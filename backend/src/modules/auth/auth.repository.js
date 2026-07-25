const prisma = require('../../config/prisma');

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, isActive: true, createdAt: true }
    });
  }

  async createUser(userData) {
    return prisma.user.create({
      data: userData,
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
  }
}

module.exports = new AuthRepository();
