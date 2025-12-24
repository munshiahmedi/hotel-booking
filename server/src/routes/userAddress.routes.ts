import { Router } from 'express';
import { UserAddressController } from '../controllers/userAddress.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const userAddressController = new UserAddressController();

// All routes require authentication
router.use(authenticateToken);

// Get current user's addresses
router.get('/my-addresses', userAddressController.getUserAddresses);

// Create address for current user
router.post('/my-addresses', userAddressController.createAddress);

// Update current user's address
router.put('/my-addresses/:id', userAddressController.updateAddress);

// Delete current user's address
router.delete('/my-addresses/:id', userAddressController.deleteAddress);

// Admin routes
router.get('/', requireRole(['ADMIN']), userAddressController.getAllAddresses);
router.get('/:id', requireRole(['ADMIN']), userAddressController.getAddressById);

export default router;
