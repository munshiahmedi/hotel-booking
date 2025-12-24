import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
      }

      const result = await authService.login(email, password, req);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email and password required' });
        return;
      }

      const result = await authService.register({ name, email, password, phone });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
    }
  }
}
