import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RolePermissionService {
  async getRolePermissions(roleId: number) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
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

    return role.role_permissions.map(rp => rp.permission);
  }

  async assignPermissionToRole(roleId: number, permissionId: number) {
    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Verify permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId }
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if already assigned
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      }
    });

    if (existingAssignment) {
      throw new Error('Permission already assigned to role');
    }

    // Create assignment
    const rolePermission = await prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permission_id: permissionId
      },
      include: {
        role: true,
        permission: true
      }
    });

    return rolePermission;
  }

  async removePermissionFromRole(roleId: number, permissionId: number) {
    // Verify assignment exists
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      }
    });

    if (!existingAssignment) {
      throw new Error('Permission not assigned to role');
    }

    // Delete assignment
    await prisma.rolePermission.delete({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      }
    });

    return { message: 'Permission removed from role successfully' };
  }

  async assignMultiplePermissionsToRole(roleId: number, permissionIds: number[]) {
    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } }
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('One or more permissions not found');
    }

    // Filter out already assigned permissions
    const existingAssignments = await prisma.rolePermission.findMany({
      where: {
        role_id: roleId,
        permission_id: { in: permissionIds }
      }
    });

    const existingPermissionIds = existingAssignments.map(rp => rp.permission_id);
    const newPermissionIds = permissionIds.filter(id => !existingPermissionIds.includes(id));

    if (newPermissionIds.length === 0) {
      throw new Error('All permissions are already assigned to role');
    }

    // Create new assignments
    const assignments = await prisma.rolePermission.createMany({
      data: newPermissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }))
    });

    return { 
      message: `${assignments.count} permissions assigned to role successfully`,
      assignedCount: assignments.count
    };
  }

  async removeAllPermissionsFromRole(roleId: number) {
    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Delete all role permissions
    const result = await prisma.rolePermission.deleteMany({
      where: { role_id: roleId }
    });

    return { 
      message: `All permissions removed from role successfully`,
      removedCount: result.count
    };
  }

  async getRolePermissionMatrix() {
    const roles = await prisma.role.findMany({
      include: {
        role_permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' }
    });

    const matrix = roles.map(role => ({
      role: {
        id: role.id,
        name: role.name
      },
      permissions: role.role_permissions.map(rp => rp.permission),
      permissionIds: role.role_permissions.map(rp => rp.permission_id)
    }));

    return {
      matrix,
      allPermissions: permissions
    };
  }
}
