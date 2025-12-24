import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await userService.getProfile(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'User not found' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, phone } = req.body;
      const user = await userService.updateProfile(userId, { name, phone });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Profile update failed' });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password required' });
        return;
      }

      const result = await userService.changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Password change failed' });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await userService.getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch users' });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'User not found' });
    }
  }

  async updateUserProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }
      
      const targetUserId = parseInt(id);
      if (isNaN(targetUserId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const { name, phone, email } = req.body;
      
      // Create audit log entry
      const auditData = {
        action: 'UPDATE_USER_PROFILE',
        targetUserId,
        performedBy: req.user!.id,
        changes: { name, phone, email },
        timestamp: new Date()
      };

      const user = await userService.updateUserProfile(targetUserId, { name, phone, email });
      
      // Log the audit entry (implementation depends on your audit system)
      console.log('AUDIT:', auditData);
      
      res.json({
        user,
        message: 'User profile updated successfully by admin',
        audit: auditData
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Profile update failed' });
    }
  }

  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      const user = await userService.deactivateUser(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'User not found' });
    }
  }
}
