import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
const userController = new UserController();

// Protected routes
router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Admin only routes
router.get('/', requireRole(['ADMIN', 'SUPERVISOR']), userController.getAllUsers);
router.get('/:id', requireRole(['ADMIN', 'SUPERVISOR']), userController.getUserById);
router.put('/:id/profile', requireRole(['ADMIN', 'SUPERVISOR']), userController.updateUserProfile);
router.put('/:id/deactivate', requireRole(['ADMIN', 'SUPERVISOR']), userController.deactivateUser);

export default router;
