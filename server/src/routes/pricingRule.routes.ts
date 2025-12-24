import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a pricing rule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      hotel_id,
      room_type_id,
      rule_name,
      rule_type,
      start_date,
      end_date,
      percentage_change,
      priority
    } = req.body;

    const rule = await prisma.pricingRule.create({
      data: {
        hotel_id,
        room_type_id,
        rule_name,
        rule_type,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        percentage_change,
        priority: priority || 1
      },
      include: {
        hotel: true,
        room_type: true
      }
    });

    return res.json(rule);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// Get pricing rules for a hotel
router.get('/hotel/:hotelId', authenticateToken, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { room_type_id, is_active } = req.query;

    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const where: any = { hotel_id: parseInt(hotelId) };
    if (room_type_id) where.room_type_id = parseInt(room_type_id as string);
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const rules = await prisma.pricingRule.findMany({
      where,
      include: {
        hotel: true,
        room_type: true
      },
      orderBy: [
        { priority: 'desc' },
        { created_at: 'desc' }
      ]
    });

    return res.json(rules);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

// Get applicable pricing rules for a specific date range
router.get('/applicable', authenticateToken, async (req, res) => {
  try {
    const { hotel_id, room_type_id, check_in, check_out } = req.query;

    const checkInDate = new Date(check_in as string);
    const checkOutDate = new Date(check_out as string);

    const rules = await prisma.pricingRule.findMany({
      where: {
        hotel_id: parseInt(hotel_id as string),
        room_type_id: room_type_id ? parseInt(room_type_id as string) : null,
        is_active: true,
        OR: [
          // Date range rules
          {
            rule_type: 'DATE_RANGE',
            start_date: { lte: checkInDate },
            end_date: { gte: checkInDate }
          },
          // Weekend rules (check if check-in is weekend)
          {
            rule_type: 'WEEKEND',
            OR: [
              { start_date: null, end_date: null },
              { start_date: { lte: checkInDate }, end_date: { gte: checkInDate } }
            ]
          },
          // Season rules
          {
            rule_type: 'SEASON',
            start_date: { lte: checkInDate },
            end_date: { gte: checkInDate }
          }
        ]
      },
      include: {
        hotel: true,
        room_type: true
      },
      orderBy: [
        { priority: 'desc' },
        { created_at: 'desc' }
      ]
    });

    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applicable pricing rules' });
  }
});

// Update a pricing rule
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rule_name,
      rule_type,
      start_date,
      end_date,
      percentage_change,
      priority,
      is_active
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Rule ID is required' });
    }

    const rule = await prisma.pricingRule.update({
      where: { id: parseInt(id) },
      data: {
        rule_name,
        rule_type,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        percentage_change,
        priority,
        is_active
      },
      include: {
        hotel: true,
        room_type: true
      }
    });

    return res.json(rule);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// Delete a pricing rule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Rule ID is required' });
    }

    await prisma.pricingRule.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

export default router;
