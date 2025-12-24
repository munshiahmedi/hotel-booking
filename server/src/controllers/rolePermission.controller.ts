import { Request, Response } from 'express';
import { RolePermissionService } from '../services/rolePermission.service';

const rolePermissionService = new RolePermissionService();

export class RolePermissionController {
  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId || '');
      if (isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }
      
      const permissions = await rolePermissionService.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Failed to fetch role permissions' });
    }
  }

  async assignPermissionToRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId || '');
      const permissionId = parseInt(req.params.permissionId || '');
      
      if (isNaN(roleId) || isNaN(permissionId)) {
        res.status(400).json({ error: 'Invalid role ID or permission ID' });
        return;
      }
      
      const assignment = await rolePermissionService.assignPermissionToRole(roleId, permissionId);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to assign permission to role' });
    }
  }

  async removePermissionFromRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId || '');
      const permissionId = parseInt(req.params.permissionId || '');
      
      if (isNaN(roleId) || isNaN(permissionId)) {
        res.status(400).json({ error: 'Invalid role ID or permission ID' });
        return;
      }
      
      const result = await rolePermissionService.removePermissionFromRole(roleId, permissionId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to remove permission from role' });
    }
  }

  async assignMultiplePermissionsToRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId || '');
      const { permissionIds } = req.body;
      
      if (isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }
      
      if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
        res.status(400).json({ error: 'Permission IDs array is required' });
        return;
      }
      
      const result = await rolePermissionService.assignMultiplePermissionsToRole(roleId, permissionIds);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to assign multiple permissions to role' });
    }
  }

  async removeAllPermissionsFromRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId || '');
      
      if (isNaN(roleId)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }
      
      const result = await rolePermissionService.removeAllPermissionsFromRole(roleId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to remove all permissions from role' });
    }
  }

  async getRolePermissionMatrix(req: Request, res: Response): Promise<void> {
    try {
      const matrix = await rolePermissionService.getRolePermissionMatrix();
      res.json(matrix);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch role permission matrix' });
    }
  }

  async getAllRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const matrix = await rolePermissionService.getRolePermissionMatrix();
      res.json(matrix);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch all role permissions' });
    }
  }

  async createRolePermission(req: Request, res: Response): Promise<void> {
    try {
      console.log('Request body:', req.body);
      const { roleId, permissionId, role_id, permission_id } = req.body;
      
      const finalRoleId = roleId || role_id;
      const finalPermissionId = permissionId || permission_id;
      
      if (!finalRoleId || !finalPermissionId) {
        console.log('Missing roleId or permissionId:', { roleId, permissionId, role_id, permission_id });
        res.status(400).json({ error: 'Role ID and Permission ID are required' });
        return;
      }
      
      const assignment = await rolePermissionService.assignPermissionToRole(finalRoleId, finalPermissionId);
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error in createRolePermission:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create role permission' });
    }
  }
}
