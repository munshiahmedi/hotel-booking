import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        user_addresses: {
          include: {
            country: true,
            state: true,
            city: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: number, updateData: {
    name?: string;
    phone?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true }
    });

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedNewPassword }
    });

    return { message: 'Password updated successfully' };
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count()
    ]);

    // Remove sensitive data
    const usersWithoutPassword = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPassword,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        user_addresses: {
          include: {
            country: true,
            state: true,
            city: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId: number, updateData: {
    name?: string;
    phone?: string;
    email?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { 
        role: true,
        user_addresses: {
          include: {
            country: true,
            state: true,
            city: true
          }
        }
      }
    });

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deactivateUser(userId: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { is_active: false },
      include: { role: true }
    });

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
