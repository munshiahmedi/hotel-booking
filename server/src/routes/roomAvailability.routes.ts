import { Router } from 'express';
import { RoomAvailabilityController } from '../controllers/roomAvailability.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const roomAvailabilityController = new RoomAvailabilityController();

// Public routes - no authentication required for viewing
router.get('/', roomAvailabilityController.getAllRoomAvailability);
router.get('/:id', roomAvailabilityController.getRoomAvailabilityById);
router.get('/room-type/:roomTypeId', roomAvailabilityController.getRoomAvailabilityByRoomType);
router.get('/room-type/:roomTypeId/date', roomAvailabilityController.getRoomAvailabilityForDate);
router.get('/room-type/:roomTypeId/check', roomAvailabilityController.checkAvailability);

// Protected routes - authentication required
router.use(authenticateToken);

// Create room availability (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), roomAvailabilityController.createRoomAvailability);

// Update room availability (hotel owner or admin only)
router.put('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), roomAvailabilityController.updateRoomAvailability);

// Delete room availability (admin only)
router.delete('/:id', requireRole(['ADMIN']), roomAvailabilityController.deleteRoomAvailability);

// Bulk update availability (hotel owner or admin only)
router.post('/bulk', requireRole(['ADMIN', 'HOTEL_OWNER']), roomAvailabilityController.bulkUpdateAvailability);

// Initialize availability for date range (hotel owner or admin only)
router.post('/initialize', requireRole(['ADMIN', 'HOTEL_OWNER']), roomAvailabilityController.initializeRoomAvailability);

export default router;
