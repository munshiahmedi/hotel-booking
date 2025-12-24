import { Request, Response } from 'express';
import { CityService } from '../services/city.service';

const cityService = new CityService();

export class CityController {
  async getAllCities(req: Request, res: Response): Promise<void> {
    try {
      const cities = await cityService.getAllCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch cities' });
    }
  }

  async getCityById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid city ID' });
        return;
      }
      
      const city = await cityService.getCityById(id);
      res.json(city);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch city';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getCitiesByState(req: Request, res: Response): Promise<void> {
    try {
      const stateId = parseInt(req.params.stateId || '');
      if (isNaN(stateId)) {
        res.status(400).json({ error: 'Invalid state ID' });
        return;
      }
      
      const cities = await cityService.getCitiesByState(stateId);
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch cities by state' });
    }
  }

  async getCitiesByCountry(req: Request, res: Response): Promise<void> {
    try {
      const countryId = parseInt(req.params.countryId || '');
      if (isNaN(countryId)) {
        res.status(400).json({ error: 'Invalid country ID' });
        return;
      }
      
      const cities = await cityService.getCitiesByCountry(countryId);
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch cities by country' });
    }
  }

  async createCity(req: Request, res: Response): Promise<void> {
    try {
      const { state_id, name } = req.body;
      
      if (!state_id || !name) {
        res.status(400).json({ error: 'State ID and city name are required' });
        return;
      }

      if (isNaN(state_id)) {
        res.status(400).json({ error: 'State ID must be a number' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'City name cannot be empty' });
        return;
      }
      
      const city = await cityService.createCity({
        state_id,
        name: name.trim()
      });
      res.status(201).json(city);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create city';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateCity(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name, state_id } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid city ID' });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) {
        if (!name.trim()) {
          res.status(400).json({ error: 'City name cannot be empty' });
          return;
        }
        updateData.name = name.trim();
      }
      if (state_id !== undefined) {
        if (isNaN(state_id)) {
          res.status(400).json({ error: 'State ID must be a number' });
          return;
        }
        updateData.state_id = state_id;
      }
      
      const city = await cityService.updateCity(id, updateData);
      res.json(city);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update city';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteCity(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid city ID' });
        return;
      }
      
      const result = await cityService.deleteCity(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete city';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async searchCities(req: Request, res: Response): Promise<void> {
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
      
      const cities = await cityService.searchCities(q);
      res.json(cities);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search cities';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getCityStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await cityService.getCityStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch city stats' });
    }
  }

  async getCitiesWithAddresses(req: Request, res: Response): Promise<void> {
    try {
      const cities = await cityService.getCitiesWithAddresses();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch cities with addresses' });
    }
  }

  async getTopCitiesByAddresses(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }
      
      const cities = await cityService.getTopCitiesByAddresses(limit);
      res.json(cities);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top cities by addresses';
      if (errorMessage.includes('between')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }
}
