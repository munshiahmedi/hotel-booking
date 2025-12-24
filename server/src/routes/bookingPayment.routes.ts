import { Router } from 'express';
import { BookingPaymentController } from '../controllers/bookingPayment.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const bookingPaymentController = new BookingPaymentController();

// Public routes - no authentication required for viewing basic info
router.get('/', bookingPaymentController.getAllBookingPayments);
router.get('/:id', bookingPaymentController.getBookingPaymentById);
router.get('/booking/:bookingId', bookingPaymentController.getPaymentsByBooking);
router.get('/booking/:bookingId/summary', bookingPaymentController.getPaymentSummaryByBooking);
router.get('/status/:status', bookingPaymentController.getPaymentsByStatus);

// Protected routes - authentication required
router.use(authenticateToken);

// Get payments by user (user can see their own payments, admin can see all)
router.get('/user/:userId', bookingPaymentController.getPaymentsByUser);

// Create booking payment (admin only)
router.post('/', requireRole(['ADMIN']), bookingPaymentController.createBookingPayment);

// Update booking payment status (admin only)
router.put('/:id/status', requireRole(['ADMIN']), bookingPaymentController.updateBookingPayment);

// Process payment refund (admin only)
router.post('/:id/refund', requireRole(['ADMIN']), bookingPaymentController.processPaymentRefund);

// Delete booking payment (admin only)
router.delete('/:id', requireRole(['ADMIN']), bookingPaymentController.deleteBookingPayment);

export default router;
