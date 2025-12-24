import { Request, Response } from 'express';
import { HotelAmenityService } from '../services/hotelAmenity.service';

const hotelAmenityService = new HotelAmenityService();

export class HotelAmenityController {
  async getAllHotelAmenities(req: Request, res: Response): Promise<void> {
    try {
      const amenities = await hotelAmenityService.getAllHotelAmenities();
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel amenities' });
    }
  }

  async getHotelAmenityById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel amenity ID' });
        return;
      }
      
      const amenity = await hotelAmenityService.getHotelAmenityById(id);
      res.json(amenity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hotel amenity';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getHotelAmenitiesByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const amenities = await hotelAmenityService.getHotelAmenitiesByHotel(hotelId);
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel amenities' });
    }
  }

  async getAmenitiesMaster(req: Request, res: Response): Promise<void> {
    try {
      const amenities = await hotelAmenityService.getAmenitiesMaster();
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch amenities master' });
    }
  }

  async getAmenityMasterById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid amenity ID' });
        return;
      }
      
      const amenity = await hotelAmenityService.getAmenityMasterById(id);
      res.json(amenity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch amenity';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createHotelAmenity(req: Request, res: Response): Promise<void> {
    try {
      const { hotel_id, amenity_id } = req.body;
      
      if (!hotel_id || !amenity_id) {
        res.status(400).json({ error: 'Hotel ID and amenity ID are required' });
        return;
      }

      if (isNaN(hotel_id) || isNaN(amenity_id)) {
        res.status(400).json({ error: 'Hotel ID and amenity ID must be numbers' });
        return;
      }
      
      const amenity = await hotelAmenityService.createHotelAmenity({
        hotel_id,
        amenity_id
      });
      
      res.status(201).json(amenity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create hotel amenity';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async createAmenityMaster(req: Request, res: Response): Promise<void> {
    try {
      const { name, icon, description } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Amenity name is required' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'Amenity name cannot be empty' });
        return;
      }
      
      const amenity = await hotelAmenityService.createAmenityMaster({
        name: name.trim(),
        icon,
        description
      });
      
      res.status(201).json(amenity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create amenity';
      if (errorMessage.includes('already exists')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteHotelAmenity(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel amenity ID' });
        return;
      }
      
      const result = await hotelAmenityService.deleteHotelAmenity(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hotel amenity';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteAmenityMaster(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid amenity ID' });
        return;
      }
      
      const result = await hotelAmenityService.deleteAmenityMaster(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete amenity';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async bulkAssignAmenitiesToHotel(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId, amenityIds } = req.body;
      
      if (!hotelId || !amenityIds) {
        res.status(400).json({ error: 'Hotel ID and amenity IDs are required' });
        return;
      }

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!Array.isArray(amenityIds)) {
        res.status(400).json({ error: 'Amenity IDs must be an array' });
        return;
      }

      if (amenityIds.length === 0) {
        res.status(400).json({ error: 'At least one amenity ID is required' });
        return;
      }
      
      const results = await hotelAmenityService.bulkAssignAmenitiesToHotel(hotelId, amenityIds);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk assign amenities';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async bulkRemoveAmenitiesFromHotel(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId, amenityIds } = req.body;
      
      if (!hotelId || !amenityIds) {
        res.status(400).json({ error: 'Hotel ID and amenity IDs are required' });
        return;
      }

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!Array.isArray(amenityIds)) {
        res.status(400).json({ error: 'Amenity IDs must be an array' });
        return;
      }

      if (amenityIds.length === 0) {
        res.status(400).json({ error: 'At least one amenity ID is required' });
        return;
      }
      
      const results = await hotelAmenityService.bulkRemoveAmenitiesFromHotel(hotelId, amenityIds);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk remove amenities';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateAmenityMaster(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name, icon, description } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid amenity ID' });
        return;
      }

      if (name !== undefined && !name.trim()) {
        res.status(400).json({ error: 'Amenity name cannot be empty' });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (icon !== undefined) updateData.icon = icon;
      if (description !== undefined) updateData.description = description;
      
      const amenity = await hotelAmenityService.updateAmenityMaster(id, updateData);
      res.json(amenity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update amenity';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }
}
