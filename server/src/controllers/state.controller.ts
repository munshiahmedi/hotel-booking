import { Request, Response } from 'express';
import { StateService } from '../services/state.service';

const stateService = new StateService();

export class StateController {
  async getAllStates(req: Request, res: Response): Promise<void> {
    try {
      const states = await stateService.getAllStates();
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch states' });
    }
  }

  async getStateById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid state ID' });
        return;
      }
      
      const state = await stateService.getStateById(id);
      res.json(state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch state';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getStatesByCountry(req: Request, res: Response): Promise<void> {
    try {
      const countryId = parseInt(req.params.countryId || '');
      if (isNaN(countryId)) {
        res.status(400).json({ error: 'Invalid country ID' });
        return;
      }
      
      const states = await stateService.getStatesByCountry(countryId);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch states by country' });
    }
  }

  async createState(req: Request, res: Response): Promise<void> {
    try {
      const { country_id, name } = req.body;
      
      if (!country_id || !name) {
        res.status(400).json({ error: 'Country ID and state name are required' });
        return;
      }

      if (isNaN(country_id)) {
        res.status(400).json({ error: 'Country ID must be a number' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'State name cannot be empty' });
        return;
      }
      
      const state = await stateService.createState({
        country_id,
        name: name.trim()
      });
      res.status(201).json(state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create state';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateState(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name, country_id } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid state ID' });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) {
        if (!name.trim()) {
          res.status(400).json({ error: 'State name cannot be empty' });
          return;
        }
        updateData.name = name.trim();
      }
      if (country_id !== undefined) {
        if (isNaN(country_id)) {
          res.status(400).json({ error: 'Country ID must be a number' });
          return;
        }
        updateData.country_id = country_id;
      }
      
      const state = await stateService.updateState(id, updateData);
      res.json(state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update state';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteState(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid state ID' });
        return;
      }
      
      const result = await stateService.deleteState(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete state';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async searchStates(req: Request, res: Response): Promise<void> {
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
      
      const states = await stateService.searchStates(q);
      res.json(states);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search states';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getStateStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await stateService.getStateStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch state stats' });
    }
  }

  async getStatesWithCities(req: Request, res: Response): Promise<void> {
    try {
      const states = await stateService.getStatesWithCities();
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch states with cities' });
    }
  }
}
