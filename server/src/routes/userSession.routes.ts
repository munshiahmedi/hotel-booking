import { Router } from 'express';
import { UserSessionController } from '../controllers/userSession.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const userSessionController = new UserSessionController();

// All routes require authentication
router.use(authenticateToken);

// Get current user's sessions
router.get('/my-sessions', userSessionController.getUserSessions);

// Delete all current user's sessions (logout all devices)
router.delete('/my-sessions', userSessionController.deleteAllUserSessions);

// Get specific session by ID (admin only)
router.get('/:id', requireRole(['ADMIN']), userSessionController.getSessionById);

// Create session (typically used internally during login)
router.post('/', requireRole(['ADMIN']), userSessionController.createSession);

// Update session (admin only)
router.put('/:id', requireRole(['ADMIN']), userSessionController.updateSession);

// Delete specific session (admin only or own session)
router.delete('/:id', requireRole(['ADMIN']), userSessionController.deleteSession);

// Delete all expired sessions (admin only, cleanup task)
router.delete('/cleanup/expired', requireRole(['ADMIN']), userSessionController.deleteExpiredSessions);

export default router;
