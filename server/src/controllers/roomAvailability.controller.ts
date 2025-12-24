import { Request, Response } from 'express';
import { RoomAvailabilityService } from '../services/roomAvailability.service';

const roomAvailabilityService = new RoomAvailabilityService();

export class RoomAvailabilityController {
  async getAllRoomAvailability(req: Request, res: Response): Promise<void> {
    try {
      const availability = await roomAvailabilityService.getAllRoomAvailability();
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch room availability' });
    }
  }

  async getRoomAvailabilityById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid availability ID' });
        return;
      }
      
      const availability = await roomAvailabilityService.getRoomAvailabilityById(id);
      res.json(availability);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRoomAvailabilityByRoomType(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      const { startDate, endDate } = req.query;

      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      if (start && isNaN(start.getTime())) {
        res.status(400).json({ error: 'Invalid start date format' });
        return;
      }

      if (end && isNaN(end.getTime())) {
        res.status(400).json({ error: 'Invalid end date format' });
        return;
      }

      if (start && end && start >= end) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }
      
      const availability = await roomAvailabilityService.getRoomAvailabilityByRoomType(roomTypeId, start, end);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch room type availability' });
    }
  }

  async getRoomAvailabilityForDate(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      const { date } = req.query;

      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }

      if (!date) {
        res.status(400).json({ error: 'Date is required' });
        return;
      }

      const checkDate = new Date(date as string);
      
      if (isNaN(checkDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      const availability = await roomAvailabilityService.getRoomAvailabilityForDate(roomTypeId, checkDate);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch room availability for date' });
    }
  }

  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      const { checkIn, checkOut, requiredRooms } = req.query;

      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }

      if (!checkIn || !checkOut) {
        res.status(400).json({ error: 'Check-in and check-out dates are required' });
        return;
      }

      const checkInDate = new Date(checkIn as string);
      const checkOutDate = new Date(checkOut as string);
      const required = parseInt(requiredRooms as string) || 1;

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      if (checkInDate >= checkOutDate) {
        res.status(400).json({ error: 'Check-out date must be after check-in date' });
        return;
      }

      if (required < 1) {
        res.status(400).json({ error: 'Required rooms must be at least 1' });
        return;
      }

      const availability = await roomAvailabilityService.checkAvailability(roomTypeId, checkInDate, checkOutDate, required);
      res.json(availability);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async createRoomAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { room_type_id, date, total_rooms, available_rooms } = req.body;
      
      if (!room_type_id || !date || total_rooms === undefined || available_rooms === undefined) {
        res.status(400).json({ error: 'Room type ID, date, total rooms, and available rooms are required' });
        return;
      }

      if (isNaN(room_type_id) || isNaN(total_rooms) || isNaN(available_rooms)) {
        res.status(400).json({ error: 'Room type ID, total rooms, and available rooms must be numbers' });
        return;
      }

      if (total_rooms < 0 || available_rooms < 0) {
        res.status(400).json({ error: 'Room counts cannot be negative' });
        return;
      }

      if (available_rooms > total_rooms) {
        res.status(400).json({ error: 'Available rooms cannot be more than total rooms' });
        return;
      }

      const availabilityDate = new Date(date);
      
      if (isNaN(availabilityDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }
      
      const availability = await roomAvailabilityService.createRoomAvailability({
        room_type_id,
        date: availabilityDate,
        total_rooms,
        available_rooms
      });
      
      res.status(201).json(availability);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateRoomAvailability(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { total_rooms, available_rooms } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid availability ID' });
        return;
      }

      if (total_rooms !== undefined && isNaN(total_rooms)) {
        res.status(400).json({ error: 'Total rooms must be a number' });
        return;
      }

      if (available_rooms !== undefined && isNaN(available_rooms)) {
        res.status(400).json({ error: 'Available rooms must be a number' });
        return;
      }

      if (total_rooms !== undefined && total_rooms < 0) {
        res.status(400).json({ error: 'Total rooms cannot be negative' });
        return;
      }

      if (available_rooms !== undefined && available_rooms < 0) {
        res.status(400).json({ error: 'Available rooms cannot be negative' });
        return;
      }

      const updateData: any = {};
      if (total_rooms !== undefined) updateData.total_rooms = total_rooms;
      if (available_rooms !== undefined) updateData.available_rooms = available_rooms;
      
      const availability = await roomAvailabilityService.updateRoomAvailability(id, updateData);
      res.json(availability);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteRoomAvailability(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid availability ID' });
        return;
      }
      
      const result = await roomAvailabilityService.deleteRoomAvailability(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async bulkUpdateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { roomTypeId, updates } = req.body;
      
      if (!roomTypeId || !updates) {
        res.status(400).json({ error: 'Room type ID and updates are required' });
        return;
      }

      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Room type ID must be a number' });
        return;
      }

      if (!Array.isArray(updates)) {
        res.status(400).json({ error: 'Updates must be an array' });
        return;
      }

      // Validate each update
      for (const update of updates) {
        if (!update.date || update.total_rooms === undefined || update.available_rooms === undefined) {
          res.status(400).json({ error: 'Each update must include date, total_rooms, and available_rooms' });
          return;
        }

        if (isNaN(update.total_rooms) || isNaN(update.available_rooms)) {
          res.status(400).json({ error: 'Room counts must be numbers' });
          return;
        }

        if (update.total_rooms < 0 || update.available_rooms < 0) {
          res.status(400).json({ error: 'Room counts cannot be negative' });
          return;
        }

        if (update.available_rooms > update.total_rooms) {
          res.status(400).json({ error: 'Available rooms cannot be more than total rooms' });
          return;
        }

        const date = new Date(update.date);
        if (isNaN(date.getTime())) {
          res.status(400).json({ error: 'Invalid date format in updates' });
          return;
        }
      }
      
      const results = await roomAvailabilityService.bulkUpdateAvailability(roomTypeId, updates);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update room availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async initializeRoomAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { roomTypeId, startDate, endDate, totalRooms } = req.body;
      
      if (!roomTypeId || !startDate || !endDate || totalRooms === undefined) {
        res.status(400).json({ error: 'Room type ID, start date, end date, and total rooms are required' });
        return;
      }

      if (isNaN(roomTypeId) || isNaN(totalRooms)) {
        res.status(400).json({ error: 'Room type ID and total rooms must be numbers' });
        return;
      }

      if (totalRooms < 1) {
        res.status(400).json({ error: 'Total rooms must be at least 1' });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      if (start >= end) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }
      
      const results = await roomAvailabilityService.initializeRoomAvailability(roomTypeId, start, end, totalRooms);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize room availability';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }
}
