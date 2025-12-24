import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service';

const permissionService = new PermissionService();

export class PermissionController {
  async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await permissionService.getAllPermissions(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch permissions' });
    }
  }

  async getPermissionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid permission ID' });
        return;
      }
      const permission = await permissionService.getPermissionById(id);
      res.json(permission);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Permission not found' });
    }
  }

  async createPermission(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Permission name is required' });
        return;
      }

      const permission = await permissionService.createPermission({ name, description });
      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create permission' });
    }
  }

  async updatePermission(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid permission ID' });
        return;
      }
      
      const { name, description } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      
      const permission = await permissionService.updatePermission(id, updateData);
      res.json(permission);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update permission' });
    }
  }

  async deletePermission(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid permission ID' });
        return;
      }
      
      const result = await permissionService.deletePermission(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete permission' });
    }
  }
}
