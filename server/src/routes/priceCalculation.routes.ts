import { Router } from 'express';
import { PriceCalculationService } from '../services/priceCalculation.service';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const priceService = new PriceCalculationService();

// All routes require authentication
router.use(authenticateToken);

// Calculate price for booking
router.post('/calculate', async (req, res) => {
  try {
    const { hotel_id, room_type_id, check_in, check_out, guests = 1 } = req.body;
    
    if (!hotel_id || !room_type_id || !check_in || !check_out) {
      return res.status(400).json({ 
        error: 'Missing required fields: hotel_id, room_type_id, check_in, check_out' 
      });
    }

    const priceBreakdown = await priceService.calculatePrice({
      hotel_id: parseInt(hotel_id),
      room_type_id: parseInt(room_type_id),
      check_in: new Date(check_in),
      check_out: new Date(check_out),
      guests: parseInt(guests),
      user_id: (req as any).user?.id
    });

    return res.json({
      success: true,
      data: priceBreakdown
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate price',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Validate price integrity for existing booking
router.get('/validate/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const isValid = await priceService.validatePriceIntegrity(parseInt(bookingId));
    
    return res.json({
      success: true,
      booking_id: parseInt(bookingId),
      is_valid: isValid,
      message: isValid ? 'Price integrity validated' : 'Price integrity check failed'
    });
  } catch (error) {
    console.error('Price validation error:', error);
    return res.status(500).json({ 
      error: 'Failed to validate price integrity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
