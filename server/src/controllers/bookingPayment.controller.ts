import { Request, Response } from 'express';
import { BookingPaymentService } from '../services/bookingPayment.service';

const bookingPaymentService = new BookingPaymentService();

export class BookingPaymentController {
  async getAllBookingPayments(req: Request, res: Response): Promise<void> {
    try {
      const payments = await bookingPaymentService.getAllBookingPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch booking payments' });
    }
  }

  async getBookingPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid booking payment ID' });
        return;
      }
      
      const payment = await bookingPaymentService.getBookingPaymentById(id);
      res.json(payment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getPaymentsByBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = parseInt(req.params.bookingId || '');
      if (isNaN(bookingId)) {
        res.status(400).json({ error: 'Invalid booking ID' });
        return;
      }
      
      const payments = await bookingPaymentService.getPaymentsByBooking(bookingId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch booking payments' });
    }
  }

  async getPaymentSummaryByBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = parseInt(req.params.bookingId || '');
      if (isNaN(bookingId)) {
        res.status(400).json({ error: 'Invalid booking ID' });
        return;
      }
      
      const summary = await bookingPaymentService.getPaymentSummaryByBooking(bookingId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payment summary' });
    }
  }

  async getPaymentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }
      
      const payments = await bookingPaymentService.getPaymentsByStatus(status);
      res.json(payments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payments by status';
      if (errorMessage.includes('Invalid status')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getPaymentsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const payments = await bookingPaymentService.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user payments' });
    }
  }

  async createBookingPayment(req: Request, res: Response): Promise<void> {
    try {
      const { booking_id, payment_id, status } = req.body;
      
      if (!booking_id || !payment_id || !status) {
        res.status(400).json({ error: 'Booking ID, payment ID, and status are required' });
        return;
      }

      if (isNaN(booking_id) || isNaN(payment_id)) {
        res.status(400).json({ error: 'Booking ID and payment ID must be numbers' });
        return;
      }
      
      const payment = await bookingPaymentService.createBookingPayment({
        booking_id,
        payment_id,
        status
      });
      
      res.status(201).json(payment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateBookingPayment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { status } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid booking payment ID' });
        return;
      }

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }
      
      const payment = await bookingPaymentService.updateBookingPaymentStatus(id, status);
      res.json(payment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteBookingPayment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid booking payment ID' });
        return;
      }
      
      const result = await bookingPaymentService.deleteBookingPayment(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete booking payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async processPaymentRefund(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { refundAmount } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid booking payment ID' });
        return;
      }

      if (refundAmount !== undefined && (isNaN(refundAmount) || refundAmount <= 0)) {
        res.status(400).json({ error: 'Refund amount must be a positive number' });
        return;
      }
      
      const result = await bookingPaymentService.processPaymentRefund(id, refundAmount);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process refund';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }
}
