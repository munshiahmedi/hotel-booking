import { Router } from 'express';
import bookingController from '../controllers/booking.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { idempotencyMiddleware } from '../services/idempotency.service';

const router = Router();

// Apply idempotency middleware to POST routes
router.post('/', idempotencyMiddleware());

// All booking routes require authentication
router.use(authenticateToken);

// Get all bookings for the authenticated user
router.get('/my-bookings', bookingController.getMyBookings);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get a specific booking by ID
router.get('/:id', bookingController.getBookingById);

// Cancel a booking
router.put('/:id/cancel', bookingController.cancelBooking);

export default router;
