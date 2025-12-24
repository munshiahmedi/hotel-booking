import { Router } from 'express';
import { TaxCalculationService } from '../services/taxCalculation.service';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const taxService = new TaxCalculationService();

// All routes require authentication
router.use(authenticateToken);

// Calculate taxes and fees
router.post('/calculate', async (req, res) => {
  try {
    const { base_amount, hotel_id, booking_date, check_in_date, check_out_date, room_type_id, guests = 1 } = req.body;
    
    if (!base_amount || !hotel_id || !booking_date || !check_in_date || !check_out_date || !room_type_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: base_amount, hotel_id, booking_date, check_in_date, check_out_date, room_type_id' 
      });
    }

    const taxBreakdown = await taxService.calculateTaxesAndFees({
      base_amount: parseFloat(base_amount),
      hotel_id: parseInt(hotel_id),
      booking_date: new Date(booking_date),
      check_in_date: new Date(check_in_date),
      check_out_date: new Date(check_out_date),
      room_type_id: parseInt(room_type_id),
      guests: parseInt(guests)
    });

    return res.json({
      success: true,
      data: taxBreakdown
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate taxes and fees',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate tax invoice for booking
router.get('/invoice/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const invoice = await taxService.generateTaxInvoice(parseInt(bookingId));
    
    return res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate tax invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create default taxes and fees for hotel
router.post('/create-default', async (req, res) => {
  try {
    const { hotel_id } = req.body;
    
    if (!hotel_id) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    await taxService.createDefaultTaxesAndFees(parseInt(hotel_id));
    
    return res.json({
      success: true,
      message: 'Default taxes and fees created successfully',
      hotel_id: parseInt(hotel_id)
    });
  } catch (error) {
    console.error('Create default taxes error:', error);
    return res.status(500).json({ 
      error: 'Failed to create default taxes and fees',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
