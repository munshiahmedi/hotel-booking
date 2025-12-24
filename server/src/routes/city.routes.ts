import { Router } from 'express';
import { CityController } from '../controllers/city.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const cityController = new CityController();

// Public routes - no authentication required for viewing
router.get('/', cityController.getAllCities);
router.get('/:id', cityController.getCityById);
router.get('/state/:stateId', cityController.getCitiesByState);
router.get('/country/:countryId', cityController.getCitiesByCountry);
router.get('/search', cityController.searchCities);
router.get('/stats', cityController.getCityStats);
router.get('/with-addresses', cityController.getCitiesWithAddresses);
router.get('/top-by-addresses', cityController.getTopCitiesByAddresses);

// Protected routes - authentication required
router.use(authenticateToken);

// Create city (admin only)
router.post('/', requireRole(['ADMIN']), cityController.createCity);

// Update city (admin only)
router.put('/:id', requireRole(['ADMIN']), cityController.updateCity);

// Delete city (admin only)
router.delete('/:id', requireRole(['ADMIN']), cityController.deleteCity);

export default router;
