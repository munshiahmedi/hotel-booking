import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a refund
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { booking_id, payment_id, amount, reason } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if booking and payment exist and belong to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: booking_id,
        user_id
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: payment_id,
        booking_id
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const refund = await prisma.refund.create({
      data: {
        booking_id,
        payment_id,
        amount,
        reason,
        status: 'INITIATED'
      },
      include: {
        booking: true,
        payment: true
      }
    });

    return res.json(refund);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create refund' });
  }
});

// Get refunds for a booking
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(bookingId),
        user_id
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const refunds = await prisma.refund.findMany({
      where: {
        booking_id: parseInt(bookingId)
      },
      include: {
        booking: true,
        payment: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.json(refunds);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch refunds' });
  }
});

// Process a refund (admin only)
router.post('/:refundId/process', authenticateToken, async (req, res) => {
  try {
    const { refundId } = req.params;
    const { status } = req.body; // PROCESSED or FAILED

    if (!refundId) {
      return res.status(400).json({ error: 'Refund ID is required' });
    }

    const refund = await prisma.refund.update({
      where: { id: parseInt(refundId) },
      data: {
        status,
        processed_at: status === 'PROCESSED' ? new Date() : null
      },
      include: {
        booking: true,
        payment: true
      }
    });

    return res.json(refund);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get all refunds (admin)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const pageInt = parseInt(page as string);
    const limitInt = parseInt(limit as string);

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        booking: {
          include: {
            user: true,
            hotel: true
          }
        },
        payment: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (pageInt - 1) * limitInt,
      take: limitInt
    });

    const total = await prisma.refund.count({ where });

    return res.json({
      refunds,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch refunds' });
  }
});

export default router;
