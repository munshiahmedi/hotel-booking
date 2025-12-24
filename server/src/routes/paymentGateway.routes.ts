import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a payment gateway
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, provider } = req.body;

    const gateway = await prisma.paymentGateway.create({
      data: {
        name,
        provider,
        is_active: true
      }
    });

    res.json(gateway);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment gateway' });
  }
});

// Get all payment gateways
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_active } = req.query;

    const where: any = {};
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const gateways = await prisma.paymentGateway.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(gateways);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment gateways' });
  }
});

// Get active payment gateways
router.get('/active', async (req, res) => {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(gateways);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active payment gateways' });
  }
});

// Update a payment gateway
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, provider, is_active } = req.body;

    const gateway = await prisma.paymentGateway.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        provider,
        is_active
      }
    });

    return res.json(gateway);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update payment gateway' });
  }
});

// Toggle gateway status (activate/deactivate)
router.post('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const gateway = await prisma.paymentGateway.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!gateway) {
      return res.status(404).json({ error: 'Payment gateway not found' });
    }

    const updatedGateway = await prisma.paymentGateway.update({
      where: { id: parseInt(id as string) },
      data: {
        is_active: !gateway.is_active
      }
    });

    return res.json(updatedGateway);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle payment gateway status' });
  }
});

export default router;
