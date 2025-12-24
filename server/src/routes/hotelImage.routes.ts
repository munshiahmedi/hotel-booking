import { Router } from 'express';
import { HotelImageController } from '../controllers/hotelImage.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const hotelImageController = new HotelImageController();

// Public routes - no authentication required for viewing
router.get('/', hotelImageController.getAllHotelImages);
router.get('/:id', hotelImageController.getHotelImageById);
router.get('/hotel/:hotelId', hotelImageController.getHotelImagesByHotel);
router.get('/hotel/:hotelId/primary', hotelImageController.getPrimaryHotelImage);

// Protected routes - authentication required
router.use(authenticateToken);

// Create hotel image (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelImageController.createHotelImage);

// Update hotel image (hotel owner or admin only)
router.put('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelImageController.updateHotelImage);

// Set primary image (hotel owner or admin only)
router.patch('/:id/primary', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelImageController.setPrimaryImage);

// Delete hotel image (hotel owner or admin only)
router.delete('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelImageController.deleteHotelImage);

// Bulk upload hotel images (hotel owner or admin only)
router.post('/bulk', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelImageController.bulkUploadHotelImages);

// Reorder hotel images (hotel owner or admin only)
router.put('/reorder', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelImageController.reorderHotelImages);

export default router;
