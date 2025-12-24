import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const roleController = new RoleController();

// All routes require authentication
router.use(authenticateToken);

// Get all roles (accessible to all authenticated users)
router.get('/', roleController.getAllRoles);

// Get role by ID (accessible to all authenticated users)
router.get('/:id', roleController.getRoleById);

// Create role (admin only)
router.post('/', requireRole(['ADMIN', 'SUPERVISOR']), roleController.createRole);

// Update role (admin only)
router.put('/:id', requireRole(['ADMIN', 'SUPERVISOR']), roleController.updateRole);

// Delete role (admin only)
router.delete('/:id', requireRole(['ADMIN', 'SUPERVISOR']), roleController.deleteRole);

export default router;
