import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const roomController = new RoomController();

// Public routes - no authentication required for viewing
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/room-type/:roomTypeId', roomController.getRoomsByRoomType);
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);
router.get('/room-type/:roomTypeId/available', roomController.getAvailableRooms);

// Protected routes - authentication required
router.use(authenticateToken);

// Create room (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), roomController.createRoom);

// Update room (hotel owner or admin only)
router.put('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), roomController.updateRoom);

// Update room status (hotel owner or admin only)
router.patch('/:id/status', requireRole(['ADMIN', 'HOTEL_OWNER']), roomController.updateRoomStatus);

// Delete room (admin only)
router.delete('/:id', requireRole(['ADMIN']), roomController.deleteRoom);

// Get rooms by status (hotel owner or admin only)
router.get('/status/:status', requireRole(['ADMIN', 'HOTEL_OWNER']), roomController.getRoomsByStatus);

export default router;
