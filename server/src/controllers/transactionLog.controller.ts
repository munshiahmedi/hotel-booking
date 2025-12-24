import { Request, Response } from 'express';
import { TransactionLogService } from '../services/transactionLog.service';

const transactionLogService = new TransactionLogService();

export class TransactionLogController {
  async getAllTransactionLogs(req: Request, res: Response): Promise<void> {
    try {
      const transactionLogs = await transactionLogService.getAllTransactionLogs();
      res.json(transactionLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch transaction logs' });
    }
  }

  async getTransactionLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid transaction log ID' });
        return;
      }
      
      const transactionLog = await transactionLogService.getTransactionLogById(id);
      res.json(transactionLog);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction log';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getTransactionLogsByPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.paymentId || '');
      if (isNaN(paymentId)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getTransactionLogsByPayment(paymentId);
      res.json(transactionLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payment transaction logs' });
    }
  }

  async getTransactionLogsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      if (!status.trim()) {
        res.status(400).json({ error: 'Status cannot be empty' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getTransactionLogsByStatus(status);
      res.json(transactionLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction logs by status';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createTransactionLog(req: Request, res: Response): Promise<void> {
    try {
      const { payment_id, status, raw_response } = req.body;
      
      if (!payment_id || !status) {
        res.status(400).json({ error: 'Payment ID and status are required' });
        return;
      }

      if (isNaN(payment_id)) {
        res.status(400).json({ error: 'Payment ID must be a number' });
        return;
      }

      if (!status.trim()) {
        res.status(400).json({ error: 'Status cannot be empty' });
        return;
      }
      
      const transactionLog = await transactionLogService.createTransactionLog({
        payment_id,
        status: status.trim(),
        raw_response
      });
      
      res.status(201).json(transactionLog);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction log';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteTransactionLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid transaction log ID' });
        return;
      }
      
      const result = await transactionLogService.deleteTransactionLog(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction log';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async getTransactionLogsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getTransactionLogsByDateRange(start, end);
      res.json(transactionLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction logs by date range';
      if (errorMessage.includes('Invalid') || errorMessage.includes('before')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getTransactionLogStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await transactionLogService.getTransactionLogStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch transaction log stats' });
    }
  }

  async getRecentTransactionLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getRecentTransactionLogs(limit);
      res.json(transactionLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent transaction logs';
      if (errorMessage.includes('between')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async searchTransactionLogs(req: Request, res: Response): Promise<void> {
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
      
      const transactionLogs = await transactionLogService.searchTransactionLogs(q);
      res.json(transactionLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search transaction logs';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getTransactionLogsByStatusAndDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!status || !status.trim()) {
        res.status(400).json({ error: 'Status is required and cannot be empty' });
        return;
      }

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getTransactionLogsByStatusAndDateRange(status, start, end);
      res.json(transactionLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction logs by status and date range';
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') || errorMessage.includes('before')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getTransactionLogsByPaymentAndStatus(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.paymentId || '');
      const { status } = req.params;
      
      if (isNaN(paymentId)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }

      if (!status || !status.trim()) {
        res.status(400).json({ error: 'Status is required and cannot be empty' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getTransactionLogsByPaymentAndStatus(paymentId, status);
      res.json(transactionLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch transaction logs by payment and status' });
    }
  }

  async bulkDeleteTransactionLogs(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'IDs must be an array' });
        return;
      }

      if (ids.length === 0) {
        res.status(400).json({ error: 'At least one ID is required' });
        return;
      }
      
      const results = await transactionLogService.bulkDeleteTransactionLogs(ids);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete transaction logs';
      if (errorMessage.includes('required')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getTransactionLogsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const transactionLogs = await transactionLogService.getTransactionLogsByUser(userId);
      res.json(transactionLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user transaction logs';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getUserTransactionLogStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const stats = await transactionLogService.getUserTransactionLogStats(userId);
      res.json(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user transaction log stats';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }
}
