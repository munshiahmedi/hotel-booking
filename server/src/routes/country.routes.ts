import { Router } from 'express';
import { CountryController } from '../controllers/country.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const countryController = new CountryController();

// Public routes - no authentication required for viewing
router.get('/', countryController.getAllCountries);
router.get('/:id', countryController.getCountryById);
router.get('/search', countryController.searchCountries);
router.get('/stats', countryController.getCountryStats);
router.get('/with-states', countryController.getCountriesWithStates);

// Protected routes - authentication required
router.use(authenticateToken);

// Create country (admin only)
router.post('/', requireRole(['ADMIN']), countryController.createCountry);

// Update country (admin only)
router.put('/:id', requireRole(['ADMIN']), countryController.updateCountry);

// Delete country (admin only)
router.delete('/:id', requireRole(['ADMIN']), countryController.deleteCountry);

export default router;
