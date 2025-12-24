import { Router } from 'express';
import { StateController } from '../controllers/state.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const stateController = new StateController();

// Public routes - no authentication required for viewing
router.get('/', stateController.getAllStates);
router.get('/:id', stateController.getStateById);
router.get('/country/:countryId', stateController.getStatesByCountry);
router.get('/search', stateController.searchStates);
router.get('/stats', stateController.getStateStats);
router.get('/with-cities', stateController.getStatesWithCities);

// Protected routes - authentication required
router.use(authenticateToken);

// Create state (admin only)
router.post('/', requireRole(['ADMIN']), stateController.createState);

// Update state (admin only)
router.put('/:id', requireRole(['ADMIN']), stateController.updateState);

// Delete state (admin only)
router.delete('/:id', requireRole(['ADMIN']), stateController.deleteState);

export default router;
