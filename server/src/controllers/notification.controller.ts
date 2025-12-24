import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications = await notificationService.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch notifications' });
    }
  }

  async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notification ID' });
        return;
      }
      
      const notification = await notificationService.getNotificationById(id);
      res.json(notification);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notification';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getNotificationsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const notifications = await notificationService.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user notifications' });
    }
  }

  async getNotificationsByStatus(req: Request, res: Response): Promise<void> {
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
      
      const notifications = await notificationService.getNotificationsByStatus(status);
      res.json(notifications);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications by status';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getNotificationsByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      
      if (!type) {
        res.status(400).json({ error: 'Type is required' });
        return;
      }

      if (!type.trim()) {
        res.status(400).json({ error: 'Type cannot be empty' });
        return;
      }
      
      const notifications = await notificationService.getNotificationsByType(type);
      res.json(notifications);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications by type';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, title, message, type, status } = req.body;
      
      if (!user_id || !title || !message || !type) {
        res.status(400).json({ error: 'User ID, title, message, and type are required' });
        return;
      }

      if (isNaN(user_id)) {
        res.status(400).json({ error: 'User ID must be a number' });
        return;
      }

      if (!title.trim()) {
        res.status(400).json({ error: 'Title cannot be empty' });
        return;
      }

      if (!message.trim()) {
        res.status(400).json({ error: 'Message cannot be empty' });
        return;
      }

      if (!type.trim()) {
        res.status(400).json({ error: 'Type cannot be empty' });
        return;
      }

      if (status && !['sent', 'failed'].includes(status)) {
        res.status(400).json({ error: 'Status must be either "sent" or "failed"' });
        return;
      }
      
      const notification = await notificationService.createNotification({
        user_id,
        title: title.trim(),
        message: message.trim(),
        type: type.trim(),
        status
      });
      
      res.status(201).json(notification);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create notification';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateNotification(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { title, message, type, status } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notification ID' });
        return;
      }

      const updateData: any = {};
      if (title !== undefined) {
        if (!title.trim()) {
          res.status(400).json({ error: 'Title cannot be empty' });
          return;
        }
        updateData.title = title.trim();
      }
      if (message !== undefined) {
        if (!message.trim()) {
          res.status(400).json({ error: 'Message cannot be empty' });
          return;
        }
        updateData.message = message.trim();
      }
      if (type !== undefined) {
        if (!type.trim()) {
          res.status(400).json({ error: 'Type cannot be empty' });
          return;
        }
        updateData.type = type.trim();
      }
      if (status !== undefined) {
        if (!['sent', 'failed'].includes(status)) {
          res.status(400).json({ error: 'Status must be either "sent" or "failed"' });
          return;
        }
        updateData.status = status;
      }
      
      const notification = await notificationService.updateNotification(id, updateData);
      res.json(notification);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update notification';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notification ID' });
        return;
      }
      
      const result = await notificationService.deleteNotification(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async markNotificationAsSent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notification ID' });
        return;
      }
      
      const notification = await notificationService.markNotificationAsSent(id);
      res.json(notification);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as sent';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async markNotificationAsFailed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notification ID' });
        return;
      }
      
      const notification = await notificationService.markNotificationAsFailed(id);
      res.json(notification);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as failed';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async bulkCreateNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { notifications } = req.body;
      
      if (!Array.isArray(notifications)) {
        res.status(400).json({ error: 'Notifications must be an array' });
        return;
      }

      if (notifications.length === 0) {
        res.status(400).json({ error: 'At least one notification is required' });
        return;
      }
      
      const results = await notificationService.bulkCreateNotifications(notifications);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk create notifications';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await notificationService.getNotificationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch notification stats' });
    }
  }

  async getUserNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const stats = await notificationService.getUserNotificationStats(userId);
      res.json(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user notification stats';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRecentNotifications(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }
      
      const notifications = await notificationService.getRecentNotifications(limit);
      res.json(notifications);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent notifications';
      if (errorMessage.includes('between')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async searchNotifications(req: Request, res: Response): Promise<void> {
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
      
      const notifications = await notificationService.searchNotifications(q);
      res.json(notifications);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search notifications';
      if (errorMessage.includes('required') || errorMessage.includes('empty')) {
        res.status(400).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }
}
