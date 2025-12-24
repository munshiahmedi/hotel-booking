import { Request, Response } from 'express';
import { UserSessionService } from '../services/userSession.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const userSessionService = new UserSessionService();

export class UserSessionController {
  async getUserSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await userSessionService.getUserSessions(userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch sessions' });
    }
  }

  async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
      }
      const session = await userSessionService.getSessionById(id);
      res.json(session);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Session not found' });
    }
  }

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, ip_address, user_agent, expires_at } = req.body;
      
      if (!user_id || !ip_address || !user_agent || !expires_at) {
        res.status(400).json({ error: 'All fields are required: user_id, ip_address, user_agent, expires_at' });
        return;
      }

      const session = await userSessionService.createSession({ 
        user_id, 
        ip_address, 
        user_agent, 
        expires_at: new Date(expires_at) 
      });
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create session' });
    }
  }

  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
      }
      
      const { expires_at } = req.body;
      const updateData: any = {};
      if (expires_at) {
        updateData.expires_at = new Date(expires_at);
      }
      const session = await userSessionService.updateSession(id, updateData);
      res.json(session);
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Session not found' ? 404 : 400;
      res.status(statusCode).json({ error: error instanceof Error ? error.message : 'Failed to update session' });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
      }
      
      const result = await userSessionService.deleteSession(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteExpiredSessions(req: Request, res: Response): Promise<void> {
    try {
      const result = await userSessionService.deleteExpiredSessions();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete expired sessions' });
    }
  }

  async deleteAllUserSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await userSessionService.deleteAllUserSessions(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete user sessions' });
    }
  }
}
