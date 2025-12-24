import { Router } from 'express';
import { CurrencyController } from '../controllers/currency.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const currencyController = new CurrencyController();

// Public routes - no authentication required for viewing
router.get('/', currencyController.getAllCurrencies);
router.get('/:id', currencyController.getCurrencyById);
router.get('/code/:code', currencyController.getCurrencyByCode);
router.get('/search', currencyController.searchCurrencies);
router.get('/stats', currencyController.getCurrencyStats);
router.get('/active', currencyController.getActiveCurrencies);

// Protected routes - authentication required
router.use(authenticateToken);

// Create currency (admin only)
router.post('/', requireRole(['ADMIN']), currencyController.createCurrency);

// Update currency (admin only)
router.put('/:id', requireRole(['ADMIN']), currencyController.updateCurrency);

// Delete currency (admin only)
router.delete('/:id', requireRole(['ADMIN']), currencyController.deleteCurrency);

export default router;
