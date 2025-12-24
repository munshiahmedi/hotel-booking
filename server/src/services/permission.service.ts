import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PermissionService {
  async getAllPermissions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { role_permissions: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.permission.count()
    ]);

    return {
      permissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPermissionById(id: number) {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            role: true
          }
        }
      }
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    return permission;
  }

  async createPermission(permissionData: {
    name: string;
    description?: string;
  }) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: permissionData.name }
    });

    if (existingPermission) {
      throw new Error('Permission already exists');
    }

    const permission = await prisma.permission.create({
      data: permissionData,
      include: {
        _count: {
          select: { role_permissions: true }
        }
      }
    });

    return permission;
  }

  async updatePermission(id: number, updateData: {
    name?: string;
    description?: string;
  }) {
    const permission = await prisma.permission.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { role_permissions: true }
        }
      }
    });

    return permission;
  }

  async deletePermission(id: number) {
    // Check if permission is assigned to any roles
    const rolePermissionCount = await prisma.rolePermission.count({
      where: { permission_id: id }
    });

    if (rolePermissionCount > 0) {
      throw new Error('Cannot delete permission assigned to roles');
    }

    await prisma.permission.delete({
      where: { id }
    });

    return { message: 'Permission deleted successfully' };
  }
}
