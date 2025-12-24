import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a payment transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { payment_id, gateway_id, gateway_transaction_id, request_payload, response_payload, status } = req.body;

    const transaction = await prisma.paymentTransaction.create({
      data: {
        payment_id,
        gateway_id,
        gateway_transaction_id,
        request_payload: JSON.stringify(request_payload),
        response_payload: JSON.stringify(response_payload),
        status
      },
      include: {
        payment: {
          include: {
            booking: true
          }
        },
        gateway: true
      }
    });

    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create payment transaction' });
  }
});

// Get transactions for a payment
router.get('/payment/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Verify payment belongs to user's booking (or admin can view all)
    const whereCondition: any = {
      id: parseInt(paymentId)
    };

    // If not admin, check if payment belongs to user's booking
    if (req.user?.role !== 'ADMIN') {
      whereCondition.booking = {
        user_id
      };
    }

    const payment = await prisma.payment.findFirst({
      where: whereCondition
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        payment_id: parseInt(paymentId)
      },
      include: {
        gateway: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
});

// Get all transactions (admin)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { status, gateway_id, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (gateway_id) where.gateway_id = parseInt(gateway_id as string);

    const pageInt = parseInt(page as string);
    const limitInt = parseInt(limit as string);

    const transactions = await prisma.paymentTransaction.findMany({
      where,
      include: {
        payment: {
          include: {
            booking: {
              include: {
                user: true,
                hotel: true
              }
            }
          }
        },
        gateway: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (pageInt - 1) * limitInt,
      take: limitInt
    });

    const total = await prisma.paymentTransaction.count({ where });

    return res.json({
      transactions,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        pages: Math.ceil(total / limitInt)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
});

// Get transaction details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        payment: {
          include: {
            booking: true
          }
        },
        gateway: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify user owns the booking or is admin
    if (req.user?.role !== 'ADMIN' && transaction.payment.booking.user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to view this transaction' });
    }

    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Update transaction status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response_payload } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const updateData: any = { status };
    if (response_payload) {
      updateData.response_payload = JSON.stringify(response_payload);
    }

    const transaction = await prisma.paymentTransaction.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        payment: true,
        gateway: true
      }
    });

    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

export default router;
