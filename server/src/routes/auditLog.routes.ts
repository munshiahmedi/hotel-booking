import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLog.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const auditLogController = new AuditLogController();

// Protected routes - authentication required for all audit log operations
router.use(authenticateToken);

// Get audit logs (admin only)
router.get('/', requireRole(['ADMIN']), auditLogController.getAllAuditLogs);
router.get('/:id', requireRole(['ADMIN']), auditLogController.getAuditLogById);
router.get('/user/:userId', requireRole(['ADMIN']), auditLogController.getAuditLogsByUser);
router.get('/action/:action', requireRole(['ADMIN']), auditLogController.getAuditLogsByAction);
router.get('/entity/:entity', requireRole(['ADMIN']), auditLogController.getAuditLogsByEntity);
router.get('/entity-id/:entityId', requireRole(['ADMIN']), auditLogController.getAuditLogsByEntityId);
router.get('/date-range', requireRole(['ADMIN']), auditLogController.getAuditLogsByDateRange);
router.get('/user/:userId/action/:action', requireRole(['ADMIN']), auditLogController.getAuditLogsByUserAndAction);
router.get('/entity/:entity/action/:action', requireRole(['ADMIN']), auditLogController.getAuditLogsByEntityAndAction);
router.get('/stats', requireRole(['ADMIN']), auditLogController.getAuditLogStats);
router.get('/user/:userId/stats', requireRole(['ADMIN']), auditLogController.getUserAuditLogStats);
router.get('/recent', requireRole(['ADMIN']), auditLogController.getRecentAuditLogs);
router.get('/search', requireRole(['ADMIN']), auditLogController.searchAuditLogs);
router.get('/user/:userId/date-range', requireRole(['ADMIN']), auditLogController.getAuditLogsByDateRangeAndUser);
router.get('/action/:action/date-range', requireRole(['ADMIN']), auditLogController.getAuditLogsByActionAndDateRange);

// Create audit log (admin only - typically used internally)
router.post('/', requireRole(['ADMIN']), auditLogController.createAuditLog);

// Delete audit log (admin only)
router.delete('/:id', requireRole(['ADMIN']), auditLogController.deleteAuditLog);

// Bulk delete audit logs (admin only)
router.post('/bulk-delete', requireRole(['ADMIN']), auditLogController.bulkDeleteAuditLogs);

export default router;
