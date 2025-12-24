import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  async getAllPayments(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentService.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payments' });
    }
  }

  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }
      
      const payment = await paymentService.getPaymentById(id);
      res.json(payment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { booking_id, amount, currency_id, method_id, status, transaction_ref } = req.body;
      
      if (!booking_id || !amount || !currency_id || !method_id) {
        res.status(400).json({ error: 'Booking ID, amount, currency ID, and payment method ID are required' });
        return;
      }

      if (isNaN(booking_id) || isNaN(amount) || isNaN(currency_id) || isNaN(method_id)) {
        res.status(400).json({ error: 'Booking ID, amount, currency ID, and payment method ID must be numbers' });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({ error: 'Amount must be positive' });
        return;
      }

      if (status && !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be one of: pending, completed, failed, refunded' });
        return;
      }
      
      const payment = await paymentService.createPayment({
        booking_id,
        amount,
        currency_id,
        method_id,
        status,
        transaction_ref
      });
      
      res.status(201).json(payment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { status, transaction_ref } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }

      if (status && !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be one of: pending, completed, failed, refunded' });
        return;
      }
      
      const payment = await paymentService.updatePayment(id, {
        status,
        transaction_ref
      });
      
      res.json(payment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }
      
      const result = await paymentService.deletePayment(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
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
      
      const payments = await paymentService.getPaymentsByBooking(bookingId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch booking payments' });
    }
  }

  async getPaymentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }
      
      const payments = await paymentService.getPaymentsByStatus(status);
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
      
      const payments = await paymentService.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user payments' });
    }
  }

  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await paymentService.getPaymentStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payment statistics' });
    }
  }
}
