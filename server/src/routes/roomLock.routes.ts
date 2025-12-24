import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Lock a room (prevent double booking)
router.post('/lock', authenticateToken, async (req, res) => {
  try {
    const { hotel_id, room_id, lock_type, locked_until } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if room is already locked
    const existingLock = await prisma.roomLock.findFirst({
      where: {
        room_id,
        status: 'ACTIVE'
      }
    });

    if (existingLock) {
      return res.status(400).json({ error: 'Room is already locked' });
    }

    const lock = await prisma.roomLock.create({
      data: {
        hotel_id,
        room_id,
        locked_by_user_id: user_id,
        lock_type,
        locked_until: new Date(locked_until),
        status: 'ACTIVE'
      },
      include: {
        hotel: true,
        room: true,
        locked_by_user: true
      }
    });

    return res.json(lock);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to lock room' });
  }
});

// Release a room lock
router.post('/release/:lockId', authenticateToken, async (req, res) => {
  try {
    const { lockId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!lockId) {
      return res.status(400).json({ error: 'Lock ID is required' });
    }

    const lock = await prisma.roomLock.findFirst({
      where: {
        id: parseInt(lockId),
        locked_by_user_id: user_id,
        status: 'ACTIVE'
      }
    });

    if (!lock) {
      return res.status(404).json({ error: 'Lock not found or not authorized' });
    }

    const updatedLock = await prisma.roomLock.update({
      where: { id: parseInt(lockId) },
      data: { status: 'RELEASED' }
    });

    return res.json(updatedLock);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to release lock' });
  }
});

// Get active locks for a hotel
router.get('/hotel/:hotelId', authenticateToken, async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const locks = await prisma.roomLock.findMany({
      where: {
        hotel_id: parseInt(hotelId),
        status: 'ACTIVE'
      },
      include: {
        room: true,
        locked_by_user: true
      }
    });

    return res.json(locks);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch locks' });
  }
});

// Clean up expired locks
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    const expiredLocks = await prisma.roomLock.updateMany({
      where: {
        status: 'ACTIVE',
        locked_until: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED'
      }
    });

    return res.json({ message: `Cleaned up ${expiredLocks.count} expired locks` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cleanup expired locks' });
  }
});

export default router;
