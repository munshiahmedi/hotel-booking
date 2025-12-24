import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoleService {
  async getAllRoles(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { users: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.role.count()
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getRoleById(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            is_active: true,
            created_at: true
          }
        },
        role_permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  async createRole(roleData: {
    name: string;
  }) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name }
    });

    if (existingRole) {
      throw new Error('Role already exists');
    }

    const role = await prisma.role.create({
      data: roleData,
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    return role;
  }

  async updateRole(id: number, updateData: {
    name?: string;
  }) {
    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    return role;
  }

  async deleteRole(id: number) {
    // Check if role has users
    const userCount = await prisma.user.count({
      where: { role_id: id }
    });

    if (userCount > 0) {
      throw new Error('Cannot delete role with existing users');
    }

    await prisma.role.delete({
      where: { id }
    });

    return { message: 'Role deleted successfully' };
  }
}
