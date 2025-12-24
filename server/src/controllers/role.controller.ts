import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

const roleService = new RoleService();

export class RoleController {
  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await roleService.getAllRoles(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch roles' });
    }
  }

  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }
      const role = await roleService.getRoleById(id);
      res.json(role);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Role not found' });
    }
  }

  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Role name is required' });
        return;
      }

      const role = await roleService.createRole({ name });
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create role' });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }
      
      const { name } = req.body;
      const role = await roleService.updateRole(id, { name });
      res.json(role);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update role' });
    }
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid role ID' });
        return;
      }
      
      const result = await roleService.deleteRole(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete role' });
    }
  }
}
