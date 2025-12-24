import { Router } from 'express';
import { HotelAmenityController } from '../controllers/hotelAmenity.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const hotelAmenityController = new HotelAmenityController();

// Public routes - no authentication required for viewing
router.get('/', hotelAmenityController.getAllHotelAmenities);
router.get('/:id', hotelAmenityController.getHotelAmenityById);
router.get('/hotel/:hotelId', hotelAmenityController.getHotelAmenitiesByHotel);
router.get('/master/all', hotelAmenityController.getAmenitiesMaster);
router.get('/master/:id', hotelAmenityController.getAmenityMasterById);

// Protected routes - authentication required
router.use(authenticateToken);

// Create hotel amenity assignment (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelAmenityController.createHotelAmenity);

// Create master amenity (admin only)
router.post('/master', requireRole(['ADMIN']), hotelAmenityController.createAmenityMaster);

// Update master amenity (admin only)
router.put('/master/:id', requireRole(['ADMIN']), hotelAmenityController.updateAmenityMaster);

// Delete hotel amenity assignment (hotel owner or admin only)
router.delete('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelAmenityController.deleteHotelAmenity);

// Delete master amenity (admin only)
router.delete('/master/:id', requireRole(['ADMIN']), hotelAmenityController.deleteAmenityMaster);

// Bulk assign amenities to hotel (hotel owner or admin only)
router.post('/bulk-assign', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelAmenityController.bulkAssignAmenitiesToHotel);

// Bulk remove amenities from hotel (hotel owner or admin only)
router.post('/bulk-remove', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelAmenityController.bulkRemoveAmenitiesFromHotel);

export default router;
