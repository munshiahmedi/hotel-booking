import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

// Public routes - no authentication required for viewing
router.get('/', paymentController.getAllPayments);
router.get('/stats', paymentController.getPaymentStats);
router.get('/status/:status', paymentController.getPaymentsByStatus);

// Protected routes - authentication required
router.use(authenticateToken);

// Get payment by ID (user can view their own payments)
router.get('/:id', paymentController.getPaymentById);

// Get payments by booking (user can view their own booking payments)
router.get('/booking/:bookingId', paymentController.getPaymentsByBooking);

// Get payments by user (user can view their own payments)
router.get('/user/:userId', paymentController.getPaymentsByUser);

// Create payment (admin and customer for testing)
router.post('/', requireRole(['ADMIN', 'CUSTOMER']), paymentController.createPayment);

// Update payment (admin only)
router.put('/:id', requireRole(['ADMIN']), paymentController.updatePayment);

// Delete payment (admin only)
router.delete('/:id', requireRole(['ADMIN']), paymentController.deletePayment);

export default router;
