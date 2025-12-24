import { Request, Response } from 'express';
import { UserAddressService } from '../services/userAddress.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const userAddressService = new UserAddressService();

export class UserAddressController {
  async getUserAddresses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await userAddressService.getUserAddresses(userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch addresses' });
    }
  }

  async getAddressById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid address ID' });
        return;
      }
      const address = await userAddressService.getAddressById(id);
      res.json(address);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Address not found' });
    }
  }

  async createAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { country_id, state_id, city_id, line1, zipcode } = req.body;
      
      if (!country_id || !state_id || !city_id || !line1 || !zipcode) {
        res.status(400).json({ error: 'All fields are required: country_id, state_id, city_id, line1, zipcode' });
        return;
      }

      const address = await userAddressService.createAddress({ 
        user_id: userId,
        country_id, 
        state_id, 
        city_id, 
        line1, 
        zipcode 
      });
      res.status(201).json(address);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create address' });
    }
  }

  async updateAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid address ID' });
        return;
      }
      
      const { country_id, state_id, city_id, line1, zipcode } = req.body;
      const updateData = { country_id, state_id, city_id, line1, zipcode };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key as keyof typeof updateData] === undefined && 
        delete updateData[key as keyof typeof updateData]
      );

      const address = await userAddressService.updateAddress(id, updateData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update address' });
    }
  }

  async deleteAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid address ID' });
        return;
      }
      
      const result = await userAddressService.deleteAddress(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete address' });
    }
  }

  async getAllAddresses(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await userAddressService.getAllAddresses(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch addresses' });
    }
  }
}
