import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';

const roomService = new RoomService();

export class RoomController {
  async getAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await roomService.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch rooms' });
    }
  }

  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room ID' });
        return;
      }
      
      const room = await roomService.getRoomById(id);
      res.json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRoomsByRoomType(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      if (isNaN(roomTypeId)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }
      
      const rooms = await roomService.getRoomsByRoomType(roomTypeId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch rooms by room type' });
    }
  }

  async getRoomsByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const rooms = await roomService.getRoomsByHotel(hotelId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel rooms' });
    }
  }

  async getAvailableRooms(req: Request, res: Response): Promise<void> {
    try {
      const roomTypeId = parseInt(req.params.roomTypeId || '');
      const { checkIn, checkOut } = req.query;

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

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      if (checkInDate >= checkOutDate) {
        res.status(400).json({ error: 'Check-out date must be after check-in date' });
        return;
      }

      const rooms = await roomService.getAvailableRooms(roomTypeId, checkInDate, checkOutDate);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch available rooms' });
    }
  }

  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const { room_type_id, room_number, floor, status } = req.body;
      
      if (!room_type_id || !room_number) {
        res.status(400).json({ error: 'Room type ID and room number are required' });
        return;
      }

      if (isNaN(room_type_id)) {
        res.status(400).json({ error: 'Room type ID must be a number' });
        return;
      }

      if (!room_number.trim()) {
        res.status(400).json({ error: 'Room number cannot be empty' });
        return;
      }

      if (status && !['available', 'maintenance'].includes(status)) {
        res.status(400).json({ error: 'Status must be available or maintenance' });
        return;
      }
      
      const room = await roomService.createRoom({
        room_type_id,
        room_number: room_number.trim(),
        floor,
        status
      });
      
      res.status(201).json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { room_number, floor, status } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room ID' });
        return;
      }

      if (room_number !== undefined && !room_number.trim()) {
        res.status(400).json({ error: 'Room number cannot be empty' });
        return;
      }

      if (status && !['available', 'maintenance'].includes(status)) {
        res.status(400).json({ error: 'Status must be available or maintenance' });
        return;
      }
      
      const room = await roomService.updateRoom(id, {
        room_number: room_number?.trim(),
        floor,
        status
      });
      
      res.json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room ID' });
        return;
      }
      
      const result = await roomService.deleteRoom(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateRoomStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { status } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room ID' });
        return;
      }

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      if (!['available', 'maintenance'].includes(status)) {
        res.status(400).json({ error: 'Status must be available or maintenance' });
        return;
      }
      
      const room = await roomService.updateRoomStatus(id, status);
      res.json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room status';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async getRoomsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      
      if (!status || !['available', 'maintenance'].includes(status)) {
        res.status(400).json({ error: 'Status must be available or maintenance' });
        return;
      }
      
      const rooms = await roomService.getRoomsByStatus(status);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch rooms by status' });
    }
  }
}
