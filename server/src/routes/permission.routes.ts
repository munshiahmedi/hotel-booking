import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const permissionController = new PermissionController();

// All routes require authentication
router.use(authenticateToken);

// Get all permissions (accessible to all authenticated users)
router.get('/', permissionController.getAllPermissions);

// Get permission by ID (accessible to all authenticated users)
router.get('/:id', permissionController.getPermissionById);

// Create permission (admin only)
router.post('/', requireRole(['ADMIN', 'SUPERVISOR']), permissionController.createPermission);

// Update permission (admin only)
router.put('/:id', requireRole(['ADMIN', 'SUPERVISOR']), permissionController.updatePermission);

// Delete permission (admin only)
router.delete('/:id', requireRole(['ADMIN', 'SUPERVISOR']), permissionController.deletePermission);

export default router;
