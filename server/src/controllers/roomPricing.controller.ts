import { Request, Response } from 'express';
import { RoomPricingService } from '../services/roomPricing.service';

const roomPricingService = new RoomPricingService();

export class RoomPricingController {
  async getAllRoomPricing(req: Request, res: Response): Promise<void> {
    try {
      const pricing = await roomPricingService.getAllRoomPricing();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch room pricing' });
    }
  }

  async getRoomPricingById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid pricing ID' });
        return;
      }
      
      const pricing = await roomPricingService.getRoomPricingById(id);
      res.json(pricing);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room pricing';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRoomPricingByRoomType(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }
      
      const pricing = await roomPricingService.getRoomPricingByRoomType(roomTypeId);
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch room type pricing' });
    }
  }

  async getCurrentRoomPricing(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      const { date } = req.query;

      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }

      const checkDate = date ? new Date(date as string) : new Date();
      
      if (isNaN(checkDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      const pricing = await roomPricingService.getCurrentRoomPricing(roomTypeId, checkDate);
      res.json(pricing);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch current pricing';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRoomPricingForDateRange(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      const { startDate, endDate } = req.query;

      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
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

      if (start >= end) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }

      const pricing = await roomPricingService.getRoomPricingForDateRange(roomTypeId, start, end);
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch pricing for date range' });
    }
  }

  async createRoomPricing(req: Request, res: Response): Promise<void> {
    try {
      const { room_type_id, date_from, date_to, price, currency_id } = req.body;
      
      if (!room_type_id || !date_from || !date_to || price === undefined || !currency_id) {
        res.status(400).json({ error: 'Room type ID, dates, price, and currency ID are required' });
        return;
      }

      if (isNaN(room_type_id) || isNaN(price) || isNaN(currency_id)) {
        res.status(400).json({ error: 'Room type ID, price, and currency ID must be numbers' });
        return;
      }

      if (price < 0) {
        res.status(400).json({ error: 'Price must be positive' });
        return;
      }

      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }
      
      const pricing = await roomPricingService.createRoomPricing({
        room_type_id,
        date_from: fromDate,
        date_to: toDate,
        price,
        currency_id
      });
      
      res.status(201).json(pricing);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room pricing';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateRoomPricing(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { date_from, date_to, price, currency_id } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid pricing ID' });
        return;
      }

      if (price !== undefined && (isNaN(price) || price < 0)) {
        res.status(400).json({ error: 'Price must be a positive number' });
        return;
      }

      if (currency_id !== undefined && isNaN(currency_id)) {
        res.status(400).json({ error: 'Currency ID must be a number' });
        return;
      }

      const updateData: any = {};
      if (date_from) updateData.date_from = new Date(date_from);
      if (date_to) updateData.date_to = new Date(date_to);
      if (price !== undefined) updateData.price = price;
      if (currency_id !== undefined) updateData.currency_id = currency_id;
      
      const pricing = await roomPricingService.updateRoomPricing(id, updateData);
      res.json(pricing);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room pricing';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteRoomPricing(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid pricing ID' });
        return;
      }
      
      const result = await roomPricingService.deleteRoomPricing(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room pricing';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteExpiredPricing(req: Request, res: Response): Promise<void> {
    try {
      const result = await roomPricingService.deleteExpiredPricing();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete expired pricing' });
    }
  }
}
