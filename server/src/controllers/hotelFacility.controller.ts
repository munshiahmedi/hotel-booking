import { Request, Response } from 'express';
import { HotelFacilityService } from '../services/hotelFacility.service';

const hotelFacilityService = new HotelFacilityService();

export class HotelFacilityController {
  async getAllHotelFacilities(req: Request, res: Response): Promise<void> {
    try {
      const facilities = await hotelFacilityService.getAllHotelFacilities();
      res.json(facilities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel facilities' });
    }
  }

  async getHotelFacilityById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel facility ID' });
        return;
      }
      
      const facility = await hotelFacilityService.getHotelFacilityById(id);
      res.json(facility);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hotel facility';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getHotelFacilitiesByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const facilities = await hotelFacilityService.getHotelFacilitiesByHotel(hotelId);
      res.json(facilities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel facilities' });
    }
  }

  async getFacilitiesMaster(req: Request, res: Response): Promise<void> {
    try {
      const facilities = await hotelFacilityService.getFacilitiesMaster();
      res.json(facilities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch facilities master' });
    }
  }

  async getFacilityMasterById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid facility ID' });
        return;
      }
      
      const facility = await hotelFacilityService.getFacilityMasterById(id);
      res.json(facility);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch facility';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createHotelFacility(req: Request, res: Response): Promise<void> {
    try {
      const { hotel_id, facility_id } = req.body;
      
      if (!hotel_id || !facility_id) {
        res.status(400).json({ error: 'Hotel ID and facility ID are required' });
        return;
      }

      if (isNaN(hotel_id) || isNaN(facility_id)) {
        res.status(400).json({ error: 'Hotel ID and facility ID must be numbers' });
        return;
      }
      
      const facility = await hotelFacilityService.createHotelFacility({
        hotel_id,
        facility_id
      });
      
      res.status(201).json(facility);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create hotel facility';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async createFacilityMaster(req: Request, res: Response): Promise<void> {
    try {
      const { name, icon, description } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Facility name is required' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'Facility name cannot be empty' });
        return;
      }
      
      const facility = await hotelFacilityService.createFacilityMaster({
        name: name.trim(),
        icon,
        description
      });
      
      res.status(201).json(facility);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create facility';
      if (errorMessage.includes('already exists')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteHotelFacility(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid hotel facility ID' });
        return;
      }
      
      const result = await hotelFacilityService.deleteHotelFacility(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hotel facility';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteFacilityMaster(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid facility ID' });
        return;
      }
      
      const result = await hotelFacilityService.deleteFacilityMaster(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete facility';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async bulkAssignFacilitiesToHotel(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId, facilityIds } = req.body;
      
      if (!hotelId || !facilityIds) {
        res.status(400).json({ error: 'Hotel ID and facility IDs are required' });
        return;
      }

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!Array.isArray(facilityIds)) {
        res.status(400).json({ error: 'Facility IDs must be an array' });
        return;
      }

      if (facilityIds.length === 0) {
        res.status(400).json({ error: 'At least one facility ID is required' });
        return;
      }
      
      const results = await hotelFacilityService.bulkAssignFacilitiesToHotel(hotelId, facilityIds);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk assign facilities';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async bulkRemoveFacilitiesFromHotel(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId, facilityIds } = req.body;
      
      if (!hotelId || !facilityIds) {
        res.status(400).json({ error: 'Hotel ID and facility IDs are required' });
        return;
      }

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!Array.isArray(facilityIds)) {
        res.status(400).json({ error: 'Facility IDs must be an array' });
        return;
      }

      if (facilityIds.length === 0) {
        res.status(400).json({ error: 'At least one facility ID is required' });
        return;
      }
      
      const results = await hotelFacilityService.bulkRemoveFacilitiesFromHotel(hotelId, facilityIds);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk remove facilities';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateFacilityMaster(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name, icon, description } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid facility ID' });
        return;
      }

      if (name !== undefined && !name.trim()) {
        res.status(400).json({ error: 'Facility name cannot be empty' });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (icon !== undefined) updateData.icon = icon;
      if (description !== undefined) updateData.description = description;
      
      const facility = await hotelFacilityService.updateFacilityMaster(id, updateData);
      res.json(facility);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update facility';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async searchFacilities(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      if (typeof q !== 'string') {
        res.status(400).json({ error: 'Search query must be a string' });
        return;
      }

      if (!q.trim()) {
        res.status(400).json({ error: 'Search query cannot be empty' });
        return;
      }
      
      const facilities = await hotelFacilityService.searchFacilities(q);
      res.json(facilities);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search facilities';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getHotelFacilitiesSummary(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const summary = await hotelFacilityService.getHotelFacilitiesSummary(hotelId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch facilities summary' });
    }
  }
}
