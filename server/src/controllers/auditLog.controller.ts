import { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLog.service';

const auditLogService = new AuditLogService();

export class AuditLogController {
  async getAllAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const auditLogs = await auditLogService.getAllAuditLogs();
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch audit logs' });
    }
  }

  async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid audit log ID' });
        return;
      }
      
      const auditLog = await auditLogService.getAuditLogById(id);
      res.json(auditLog);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit log';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const auditLogs = await auditLogService.getAuditLogsByUser(userId);
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user audit logs' });
    }
  }

  async getAuditLogsByAction(req: Request, res: Response): Promise<void> {
    try {
      const { action } = req.params;
      
      if (!action) {
        res.status(400).json({ error: 'Action is required' });
        return;
      }

      if (!action.trim()) {
        res.status(400).json({ error: 'Action cannot be empty' });
        return;
      }
      
      const auditLogs = await auditLogService.getAuditLogsByAction(action);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs by action';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByEntity(req: Request, res: Response): Promise<void> {
    try {
      const { entity } = req.params;
      
      if (!entity) {
        res.status(400).json({ error: 'Entity is required' });
        return;
      }

      if (!entity.trim()) {
        res.status(400).json({ error: 'Entity cannot be empty' });
        return;
      }
      
      const auditLogs = await auditLogService.getAuditLogsByEntity(entity);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs by entity';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByEntityId(req: Request, res: Response): Promise<void> {
    try {
      const entityId = parseInt(req.params.entityId || '');
      if (isNaN(entityId)) {
        res.status(400).json({ error: 'Invalid entity ID' });
        return;
      }
      
      const auditLogs = await auditLogService.getAuditLogsByEntityId(entityId);
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch audit logs by entity ID' });
    }
  }

  async createAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, action, entity, entity_id, payload } = req.body;
      
      if (!user_id || !action || !entity || entity_id === undefined) {
        res.status(400).json({ error: 'User ID, action, entity, and entity ID are required' });
        return;
      }

      if (isNaN(user_id) || isNaN(entity_id)) {
        res.status(400).json({ error: 'User ID and entity ID must be numbers' });
        return;
      }

      if (!action.trim()) {
        res.status(400).json({ error: 'Action cannot be empty' });
        return;
      }

      if (!entity.trim()) {
        res.status(400).json({ error: 'Entity cannot be empty' });
        return;
      }
      
      const auditLog = await auditLogService.createAuditLog({
        user_id,
        action: action.trim(),
        entity: entity.trim(),
        entity_id,
        payload
      });
      
      res.status(201).json(auditLog);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create audit log';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid audit log ID' });
        return;
      }
      
      const result = await auditLogService.deleteAuditLog(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete audit log';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByDateRange(req: Request, res: Response): Promise<void> {
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
      
      const auditLogs = await auditLogService.getAuditLogsByDateRange(start, end);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs by date range';
      if (errorMessage.includes('Invalid') || errorMessage.includes('before')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByUserAndAction(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      const { action } = req.params;
      
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      if (!action || !action.trim()) {
        res.status(400).json({ error: 'Action is required and cannot be empty' });
        return;
      }
      
      const auditLogs = await auditLogService.getAuditLogsByUserAndAction(userId, action);
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch audit logs by user and action' });
    }
  }

  async getAuditLogsByEntityAndAction(req: Request, res: Response): Promise<void> {
    try {
      const { entity, action } = req.params;
      
      if (!entity || !action) {
        res.status(400).json({ error: 'Entity and action are required' });
        return;
      }

      if (!entity.trim() || !action.trim()) {
        res.status(400).json({ error: 'Entity and action cannot be empty' });
        return;
      }
      
      const auditLogs = await auditLogService.getAuditLogsByEntityAndAction(entity, action);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs by entity and action';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await auditLogService.getAuditLogStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch audit log stats' });
    }
  }

  async getUserAuditLogStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const stats = await auditLogService.getUserAuditLogStats(userId);
      res.json(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user audit log stats';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRecentAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }
      
      const auditLogs = await auditLogService.getRecentAuditLogs(limit);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent audit logs';
      if (errorMessage.includes('between')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async searchAuditLogs(req: Request, res: Response): Promise<void> {
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
      
      const auditLogs = await auditLogService.searchAuditLogs(q);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search audit logs';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByDateRangeAndUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      const { startDate, endDate } = req.query;
      
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
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
      
      const auditLogs = await auditLogService.getAuditLogsByDateRangeAndUser(userId, start, end);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs by date range and user';
      if (errorMessage.includes('Invalid') || errorMessage.includes('before')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async bulkDeleteAuditLogs(req: Request, res: Response): Promise<void> {
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
      
      const results = await auditLogService.bulkDeleteAuditLogs(ids);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete audit logs';
      if (errorMessage.includes('required')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getAuditLogsByActionAndDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { action } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!action || !action.trim()) {
        res.status(400).json({ error: 'Action is required and cannot be empty' });
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
      
      const auditLogs = await auditLogService.getAuditLogsByActionAndDateRange(action, start, end);
      res.json(auditLogs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs by action and date range';
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') || errorMessage.includes('before')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }
}
