import { Router } from 'express';
import { TransactionLogController } from '../controllers/transactionLog.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const transactionLogController = new TransactionLogController();

// Protected routes - authentication required for all transaction log operations
router.use(authenticateToken);

// Get transaction logs (admin only)
router.get('/', requireRole(['ADMIN']), transactionLogController.getAllTransactionLogs);
router.get('/:id', requireRole(['ADMIN']), transactionLogController.getTransactionLogById);
router.get('/payment/:paymentId', requireRole(['ADMIN']), transactionLogController.getTransactionLogsByPayment);
router.get('/status/:status', requireRole(['ADMIN']), transactionLogController.getTransactionLogsByStatus);
router.get('/date-range', requireRole(['ADMIN']), transactionLogController.getTransactionLogsByDateRange);
router.get('/status/:status/date-range', requireRole(['ADMIN']), transactionLogController.getTransactionLogsByStatusAndDateRange);
router.get('/payment/:paymentId/status/:status', requireRole(['ADMIN']), transactionLogController.getTransactionLogsByPaymentAndStatus);
router.get('/user/:userId', requireRole(['ADMIN']), transactionLogController.getTransactionLogsByUser);
router.get('/user/:userId/stats', requireRole(['ADMIN']), transactionLogController.getUserTransactionLogStats);
router.get('/stats', requireRole(['ADMIN']), transactionLogController.getTransactionLogStats);
router.get('/recent', requireRole(['ADMIN']), transactionLogController.getRecentTransactionLogs);
router.get('/search', requireRole(['ADMIN']), transactionLogController.searchTransactionLogs);

// Create transaction log (admin only - typically used internally by payment processors)
router.post('/', requireRole(['ADMIN']), transactionLogController.createTransactionLog);

// Delete transaction log (admin only)
router.delete('/:id', requireRole(['ADMIN']), transactionLogController.deleteTransactionLog);

// Bulk delete transaction logs (admin only)
router.post('/bulk-delete', requireRole(['ADMIN']), transactionLogController.bulkDeleteTransactionLogs);

export default router;
