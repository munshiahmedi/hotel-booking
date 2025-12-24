import { Router } from 'express';
import { RoomTypeController } from '../controllers/roomType.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const roomTypeController = new RoomTypeController();

// Public routes - no authentication required for viewing
router.get('/', roomTypeController.getAllRoomTypes);
router.get('/:id', roomTypeController.getRoomTypeById);
router.get('/hotel/:hotelId', roomTypeController.getRoomTypesByHotel);
router.get('/hotel/:hotelId/available', roomTypeController.getAvailableRoomTypes);

// Protected routes - authentication required
router.use(authenticateToken);

// Create room type (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), roomTypeController.createRoomType);

// Update room type (hotel owner or admin only)
router.put('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), roomTypeController.updateRoomType);

// Delete room type (admin only)
router.delete('/:id', requireRole(['ADMIN']), roomTypeController.deleteRoomType);

export default router;
