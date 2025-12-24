import { Router } from 'express';
import { PaymentMethodController } from '../controllers/paymentMethod.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const paymentMethodController = new PaymentMethodController();

// Public routes - no authentication required for viewing
router.get('/', paymentMethodController.getAllPaymentMethods);
router.get('/active', paymentMethodController.getActivePaymentMethods);
router.get('/search', paymentMethodController.searchPaymentMethods);
router.get('/stats', paymentMethodController.getPaymentMethodStats);
router.get('/name/:name', paymentMethodController.getPaymentMethodByName);
router.get('/provider/:provider', paymentMethodController.getPaymentMethodsByProvider);
router.get('/:id', paymentMethodController.getPaymentMethodById);

// Protected routes - authentication required
router.use(authenticateToken);

// Create payment method (admin only)
router.post('/', requireRole(['ADMIN']), paymentMethodController.createPaymentMethod);

// Update payment method (admin only)
router.put('/:id', requireRole(['ADMIN']), paymentMethodController.updatePaymentMethod);

// Delete payment method (admin only)
router.delete('/:id', requireRole(['ADMIN']), paymentMethodController.deletePaymentMethod);

// Activate/deactivate payment method (admin only)
router.post('/:id/activate', requireRole(['ADMIN']), paymentMethodController.activatePaymentMethod);
router.post('/:id/deactivate', requireRole(['ADMIN']), paymentMethodController.deactivatePaymentMethod);

export default router;
