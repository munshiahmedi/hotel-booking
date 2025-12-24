import { Request, Response } from 'express';
import { PaymentMethodService } from '../services/paymentMethod.service';

const paymentMethodService = new PaymentMethodService();

export class PaymentMethodController {
  async getAllPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const paymentMethods = await paymentMethodService.getAllPaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payment methods' });
    }
  }

  async getPaymentMethodById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment method ID' });
        return;
      }
      
      const paymentMethod = await paymentMethodService.getPaymentMethodById(id);
      res.json(paymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment method';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getPaymentMethodByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      
      if (!name) {
        res.status(400).json({ error: 'Payment method name is required' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'Payment method name cannot be empty' });
        return;
      }
      
      const paymentMethod = await paymentMethodService.getPaymentMethodByName(name);
      res.json(paymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment method';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async getActivePaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const paymentMethods = await paymentMethodService.getActivePaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch active payment methods' });
    }
  }

  async createPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { name, provider, active } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Payment method name is required' });
        return;
      }

      if (!name.trim()) {
        res.status(400).json({ error: 'Payment method name cannot be empty' });
        return;
      }
      
      const paymentMethod = await paymentMethodService.createPaymentMethod({
        name: name.trim(),
        provider,
        active
      });
      res.status(201).json(paymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment method';
      if (errorMessage.includes('already exists')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name, provider, active } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment method ID' });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) {
        if (!name.trim()) {
          res.status(400).json({ error: 'Payment method name cannot be empty' });
          return;
        }
        updateData.name = name.trim();
      }
      if (provider !== undefined) {
        updateData.provider = provider;
      }
      if (active !== undefined) {
        updateData.active = active;
      }
      
      const paymentMethod = await paymentMethodService.updatePaymentMethod(id, updateData);
      res.json(paymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payment method';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deletePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment method ID' });
        return;
      }
      
      const result = await paymentMethodService.deletePaymentMethod(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment method';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async activatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment method ID' });
        return;
      }
      
      const paymentMethod = await paymentMethodService.activatePaymentMethod(id);
      res.json(paymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate payment method';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async deactivatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid payment method ID' });
        return;
      }
      
      const paymentMethod = await paymentMethodService.deactivatePaymentMethod(id);
      res.json(paymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate payment method';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async searchPaymentMethods(req: Request, res: Response): Promise<void> {
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
      
      const paymentMethods = await paymentMethodService.searchPaymentMethods(q);
      res.json(paymentMethods);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search payment methods';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getPaymentMethodStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await paymentMethodService.getPaymentMethodStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payment method stats' });
    }
  }

  async getPaymentMethodsByProvider(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      
      if (!provider) {
        res.status(400).json({ error: 'Provider name is required' });
        return;
      }

      if (!provider.trim()) {
        res.status(400).json({ error: 'Provider name cannot be empty' });
        return;
      }
      
      const paymentMethods = await paymentMethodService.getPaymentMethodsByProvider(provider);
      res.json(paymentMethods);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment methods by provider';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }
}
