import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a refund policy
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { hotel_id, hours_before_checkin, refund_percentage } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user owns the hotel
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: hotel_id,
        owner_id: user_id
      }
    });

    if (!hotel) {
      return res.status(403).json({ error: 'Not authorized to create refund policy for this hotel' });
    }

    const policy = await prisma.refundPolicy.create({
      data: {
        hotel_id,
        hours_before_checkin,
        refund_percentage
      },
      include: {
        hotel: true
      }
    });

    return res.json(policy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create refund policy' });
  }
});

// Get refund policies for a hotel
router.get('/hotel/:hotelId', authenticateToken, async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const policies = await prisma.refundPolicy.findMany({
      where: {
        hotel_id: parseInt(hotelId)
      },
      include: {
        hotel: true
      },
      orderBy: {
        hours_before_checkin: 'asc'
      }
    });

    return res.json(policies);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch refund policies' });
  }
});

// Calculate refund amount based on policies
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { hotel_id, booking_amount, check_in_date } = req.body;

    const now = new Date();
    const checkInDate = new Date(check_in_date);
    const hoursUntilCheckin = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Find applicable refund policy
    const policy = await prisma.refundPolicy.findFirst({
      where: {
        hotel_id,
        hours_before_checkin: {
          lte: hoursUntilCheckin
        }
      },
      orderBy: {
        hours_before_checkin: 'desc'
      }
    });

    if (!policy) {
      return res.json({
        refund_percentage: 0,
        refund_amount: 0,
        applicable_policy: null
      });
    }

    const refund_amount = (Number(booking_amount) * Number(policy.refund_percentage)) / 100;

    return res.json({
      refund_percentage: policy.refund_percentage,
      refund_amount,
      applicable_policy: policy
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate refund' });
  }
});

// Update a refund policy
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hours_before_checkin, refund_percentage } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Policy ID is required' });
    }

    // Verify policy belongs to user's hotel
    const policy = await prisma.refundPolicy.findFirst({
      where: {
        id: parseInt(id),
        hotel: {
          owner_id: user_id
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Refund policy not found' });
    }

    const updatedPolicy = await prisma.refundPolicy.update({
      where: { id: parseInt(id) },
      data: {
        hours_before_checkin,
        refund_percentage
      },
      include: {
        hotel: true
      }
    });

    return res.json(updatedPolicy);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update refund policy' });
  }
});

// Delete a refund policy
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Policy ID is required' });
    }

    // Verify policy belongs to user's hotel
    const policy = await prisma.refundPolicy.findFirst({
      where: {
        id: parseInt(id),
        hotel: {
          owner_id: user_id
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Refund policy not found' });
    }

    await prisma.refundPolicy.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ message: 'Refund policy deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete refund policy' });
  }
});

export default router;
