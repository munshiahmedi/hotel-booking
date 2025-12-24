import { Router } from 'express';
import { HotelFacilityController } from '../controllers/hotelFacility.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const hotelFacilityController = new HotelFacilityController();

// Public routes - no authentication required for viewing
router.get('/', hotelFacilityController.getAllHotelFacilities);
router.get('/:id', hotelFacilityController.getHotelFacilityById);
router.get('/hotel/:hotelId', hotelFacilityController.getHotelFacilitiesByHotel);
router.get('/hotel/:hotelId/summary', hotelFacilityController.getHotelFacilitiesSummary);
router.get('/master/all', hotelFacilityController.getFacilitiesMaster);
router.get('/master/:id', hotelFacilityController.getFacilityMasterById);
router.get('/search', hotelFacilityController.searchFacilities);

// Protected routes - authentication required
router.use(authenticateToken);

// Create hotel facility assignment (hotel owner or admin only)
router.post('/', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelFacilityController.createHotelFacility);

// Create master facility (admin only)
router.post('/master', requireRole(['ADMIN']), hotelFacilityController.createFacilityMaster);

// Update master facility (admin only)
router.put('/master/:id', requireRole(['ADMIN']), hotelFacilityController.updateFacilityMaster);

// Delete hotel facility assignment (hotel owner or admin only)
router.delete('/:id', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelFacilityController.deleteHotelFacility);

// Delete master facility (admin only)
router.delete('/master/:id', requireRole(['ADMIN']), hotelFacilityController.deleteFacilityMaster);

// Bulk assign facilities to hotel (hotel owner or admin only)
router.post('/bulk-assign', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelFacilityController.bulkAssignFacilitiesToHotel);

// Bulk remove facilities from hotel (hotel owner or admin only)
router.post('/bulk-remove', requireRole(['ADMIN', 'HOTEL_OWNER']), hotelFacilityController.bulkRemoveFacilitiesFromHotel);

export default router;
