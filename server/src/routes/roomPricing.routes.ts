import { Router } from 'express';
import { RoomPricingController } from '../controllers/roomPricing.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const roomPricingController = new RoomPricingController();

// Public routes - no authentication required for viewing
router.get('/', roomPricingController.getAllRoomPricing);
router.get('/:id', roomPricingController.getRoomPricingById);
router.get('/room-type/:roomTypeId', roomPricingController.getRoomPricingByRoomType);
router.get('/room-type/:roomTypeId/current', roomPricingController.getCurrentRoomPricing);
router.get('/room-type/:roomTypeId/range', roomPricingController.getRoomPricingForDateRange);

// Protected routes - authentication required
router.use(authenticateToken);

// Create room pricing (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), roomPricingController.createRoomPricing);

// Update room pricing (hotel owner or admin only)
router.put('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), roomPricingController.updateRoomPricing);

// Delete room pricing (admin only)
router.delete('/:id', requireRole(['ADMIN']), roomPricingController.deleteRoomPricing);

// Delete expired pricing (admin only, cleanup task)
router.delete('/cleanup/expired', requireRole(['ADMIN']), roomPricingController.deleteExpiredPricing);

export default router;
