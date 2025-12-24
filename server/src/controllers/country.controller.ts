import { Request, Response } from 'express';
import { CountryService } from '../services/country.service';

const countryService = new CountryService();

export class CountryController {
  async getAllCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await countryService.getAllCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch countries' });
    }
  }

  async getCountryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid country ID' });
        return;
      }
      
      const country = await countryService.getCountryById(id);
      res.json(country);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch country';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createCountry(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Country name is required' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'Country name cannot be empty' });
        return;
      }
      
      const country = await countryService.createCountry({ name: name.trim() });
      res.status(201).json(country);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create country';
      if (errorMessage.includes('already exists')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateCountry(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid country ID' });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) {
        if (!name.trim()) {
          res.status(400).json({ error: 'Country name cannot be empty' });
          return;
        }
        updateData.name = name.trim();
      }
      
      const country = await countryService.updateCountry(id, updateData);
      res.json(country);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update country';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteCountry(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid country ID' });
        return;
      }
      
      const result = await countryService.deleteCountry(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete country';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async searchCountries(req: Request, res: Response): Promise<void> {
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
      
      const countries = await countryService.searchCountries(q);
      res.json(countries);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search countries';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getCountryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await countryService.getCountryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch country stats' });
    }
  }

  async getCountriesWithStates(req: Request, res: Response): Promise<void> {
    try {
      const countries = await countryService.getCountriesWithStates();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch countries with states' });
    }
  }
}
