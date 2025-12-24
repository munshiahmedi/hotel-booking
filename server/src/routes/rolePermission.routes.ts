import { Router } from 'express';
import { RolePermissionController } from '../controllers/rolePermission.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const rolePermissionController = new RolePermissionController();

// All routes require authentication
router.use(authenticateToken);

// Get all role permissions (admin only)
router.get('/', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.getAllRolePermissions);

// Create role permission (admin only)
router.post('/', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.createRolePermission);

// Get role permission matrix (admin only)
router.get('/matrix', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.getRolePermissionMatrix);

// Get permissions for a specific role (admin only)
router.get('/role/:roleId', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.getRolePermissions);

// Assign permission to role (admin only)
router.post('/role/:roleId/permission/:permissionId', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.assignPermissionToRole);

// Remove permission from role (admin only)
router.delete('/role/:roleId/permission/:permissionId', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.removePermissionFromRole);

// Assign multiple permissions to role (admin only)
router.post('/role/:roleId/permissions', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.assignMultiplePermissionsToRole);

// Remove all permissions from role (admin only)
router.delete('/role/:roleId/permissions', requireRole(['ADMIN', 'SUPERVISOR']), rolePermissionController.removeAllPermissionsFromRole);

export default router;
