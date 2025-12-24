import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// Public routes - no authentication required for basic viewing
router.get('/', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
router.get('/status/:status', notificationController.getNotificationsByStatus);
router.get('/type/:type', notificationController.getNotificationsByType);
router.get('/recent', notificationController.getRecentNotifications);
router.get('/stats', notificationController.getNotificationStats);

// Protected routes - authentication required
router.use(authenticateToken);

// Get notifications by user (user can see their own notifications, admin can see all)
router.get('/user/:userId', notificationController.getNotificationsByUser);
router.get('/user/:userId/stats', notificationController.getUserNotificationStats);

// Create notification (admin only)
router.post('/', requireRole(['ADMIN']), notificationController.createNotification);

// Update notification (admin only)
router.put('/:id', requireRole(['ADMIN']), notificationController.updateNotification);

// Delete notification (admin only)
router.delete('/:id', requireRole(['ADMIN']), notificationController.deleteNotification);

// Mark notification as sent/failed (admin only)
router.put('/:id/mark-sent', requireRole(['ADMIN']), notificationController.markNotificationAsSent);
router.put('/:id/mark-failed', requireRole(['ADMIN']), notificationController.markNotificationAsFailed);

// Bulk create notifications (admin only)
router.post('/bulk-create', requireRole(['ADMIN']), notificationController.bulkCreateNotifications);

// Search notifications (admin only)
router.get('/search', requireRole(['ADMIN']), notificationController.searchNotifications);

export default router;
