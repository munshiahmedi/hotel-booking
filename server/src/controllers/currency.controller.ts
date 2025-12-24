import { Request, Response } from 'express';
import { CurrencyService } from '../services/currency.service';

const currencyService = new CurrencyService();

export class CurrencyController {
  async getAllCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const currencies = await currencyService.getAllCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch currencies' });
    }
  }

  async getCurrencyById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid currency ID' });
        return;
      }
      
      const currency = await currencyService.getCurrencyById(id);
      res.json(currency);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch currency';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getCurrencyByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
      if (!code) {
        res.status(400).json({ error: 'Currency code is required' });
        return;
      }

      if (!code.trim()) {
        res.status(400).json({ error: 'Currency code cannot be empty' });
        return;
      }
      
      const currency = await currencyService.getCurrencyByCode(code);
      res.json(currency);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch currency';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async createCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      
      if (!code) {
        res.status(400).json({ error: 'Currency code is required' });
        return;
      }

      if (!code.trim()) {
        res.status(400).json({ error: 'Currency code cannot be empty' });
        return;
      }
      
      const currency = await currencyService.createCurrency({ code: code.trim() });
      res.status(201).json(currency);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create currency';
      if (errorMessage.includes('already exists')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateCurrency(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { code } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid currency ID' });
        return;
      }

      const updateData: any = {};
      if (code !== undefined) {
        if (!code.trim()) {
          res.status(400).json({ error: 'Currency code cannot be empty' });
          return;
        }
        updateData.code = code.trim();
      }
      
      const currency = await currencyService.updateCurrency(id, updateData);
      res.json(currency);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update currency';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteCurrency(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid currency ID' });
        return;
      }
      
      const result = await currencyService.deleteCurrency(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete currency';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async searchCurrencies(req: Request, res: Response): Promise<void> {
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
      
      const currencies = await currencyService.searchCurrencies(q);
      res.json(currencies);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search currencies';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getCurrencyStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await currencyService.getCurrencyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch currency stats' });
    }
  }

  async getActiveCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const currencies = await currencyService.getActiveCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch active currencies' });
    }
  }
}
