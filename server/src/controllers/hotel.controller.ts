import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import hotelService, { CreateHotelData, UpdateHotelData, HotelFilters } from '../services/hotel.service';

class HotelController {
  async createHotel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hotelData: CreateHotelData = {
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        star_rating: req.body.star_rating,
        owner_id: req.user!.id, // Use authenticated user's ID as owner
        address: req.body.address,
        policy: req.body.policy
      };

      const hotel = await hotelService.createHotel(hotelData);
      res.status(201).json(hotel);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create hotel' });
    }
  }

  async getAllHotels(req: Request, res: Response): Promise<void> {
    try {
      const filters: HotelFilters = {};
      
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.city_id) filters.city_id = parseInt(req.query.city_id as string);
      if (req.query.state_id) filters.state_id = parseInt(req.query.state_id as string);
      if (req.query.country_id) filters.country_id = parseInt(req.query.country_id as string);
      if (req.query.star_rating) filters.star_rating = parseInt(req.query.star_rating as string);
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.page) filters.page = parseInt(req.query.page as string);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);

      const result = await hotelService.getAllHotels(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotels' });
    }
  }

  async getHotelById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }

      const hotel = await hotelService.getHotelById(id);
      if (!hotel) {
        res.status(404).json({ error: 'Hotel not found' });
        return;
      }

      res.json(hotel);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel' });
    }
  }

  async updateHotel(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }

      const updateData: UpdateHotelData = {
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        star_rating: req.body.star_rating,
        status: req.body.status,
        address: req.body.address,
        policy: req.body.policy
      };

      const hotel = await hotelService.updateHotel(id, updateData);
      res.json(hotel);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update hotel' });
    }
  }

  async deleteHotel(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }

      await hotelService.deleteHotel(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete hotel' });
    }
  }

  async getMyHotels(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hotels = await hotelService.getHotelsByOwner(req.user!.id);
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotels' });
    }
  }

  async getMyHotelStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hotels = await hotelService.getHotelsByOwner(req.user!.id);
      
      // Calculate status summary
      const status = {
        totalHotels: hotels.length,
        activeHotels: hotels.filter(h => h.status === 'active').length,
        inactiveHotels: hotels.filter(h => h.status === 'inactive').length,
        hotels: hotels.map(h => ({
          id: h.id,
          name: h.name,
          status: h.status,
          star_rating: h.star_rating,
          created_at: h.created_at
        }))
      };
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel status' });
    }
  }

  async updateHotelStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }

      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const hotel = await hotelService.updateHotelStatus(id, status);
      res.json(hotel);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update hotel status' });
    }
  }

  async searchHotels(req: Request, res: Response): Promise<void> {
    try {
      const filters: HotelFilters = {};
      
      if (req.query.q) filters.search = req.query.q as string;
      if (req.query.city_id) filters.city_id = parseInt(req.query.city_id as string);
      if (req.query.state_id) filters.state_id = parseInt(req.query.state_id as string);
      if (req.query.country_id) filters.country_id = parseInt(req.query.country_id as string);
      if (req.query.star_rating) filters.star_rating = parseInt(req.query.star_rating as string);
      if (req.query.page) filters.page = parseInt(req.query.page as string);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);

      // Only show active hotels for public search
      filters.status = 'active';

      const result = await hotelService.getAllHotels(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to search hotels' });
    }
  }
}

export default new HotelController();
