import { Request, Response } from 'express';
import { RoomTypeService } from '../services/roomType.service';

const roomTypeService = new RoomTypeService();

export class RoomTypeController {
  async getAllRoomTypes(req: Request, res: Response): Promise<void> {
    try {
      const roomTypes = await roomTypeService.getAllRoomTypes();
      res.json(roomTypes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch room types' });
    }
  }

  async getRoomTypeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }
      
      const roomType = await roomTypeService.getRoomTypeById(id);
      res.json(roomType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room type';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getRoomTypesByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const roomTypes = await roomTypeService.getRoomTypesByHotel(hotelId);
      res.json(roomTypes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel room types' });
    }
  }

  async getAvailableRoomTypes(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      const { checkIn, checkOut } = req.query;

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
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

      const roomTypes = await roomTypeService.getAvailableRoomTypes(hotelId, checkInDate, checkOutDate);
      res.json(roomTypes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch available room types' });
    }
  }

  async createRoomType(req: Request, res: Response): Promise<void> {
    try {
      console.log('Request body:', req.body);
      const { hotel_id, name, description, max_guests, base_price, hotelId, maxGuests, basePrice } = req.body;
      
      const finalHotelId = hotel_id || hotelId;
      const finalMaxGuests = max_guests || maxGuests;
      const finalBasePrice = base_price || basePrice;
      
      if (!finalHotelId || !name || finalMaxGuests === undefined || finalBasePrice === undefined) {
        console.log('Missing required fields:', { finalHotelId, name, finalMaxGuests, finalBasePrice });
        res.status(400).json({ error: 'Hotel ID, name, max guests, and base price are required' });
        return;
      }

      if (isNaN(finalHotelId) || isNaN(finalMaxGuests) || isNaN(finalBasePrice)) {
        res.status(400).json({ error: 'Hotel ID, max guests, and base price must be numbers' });
        return;
      }

      if (finalMaxGuests < 1 || finalMaxGuests > 20) {
        res.status(400).json({ error: 'Max guests must be between 1 and 20' });
        return;
      }

      if (finalBasePrice < 0) {
        res.status(400).json({ error: 'Base price must be positive' });
        return;
      }
      
      const roomType = await roomTypeService.createRoomType({
        hotel_id: finalHotelId,
        name,
        description,
        max_guests: finalMaxGuests,
        base_price: finalBasePrice
      });
      
      res.status(201).json(roomType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room type';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateRoomType(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { name, description, max_guests, base_price } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }

      if (max_guests !== undefined && (isNaN(max_guests) || max_guests < 1 || max_guests > 20)) {
        res.status(400).json({ error: 'Max guests must be a number between 1 and 20' });
        return;
      }

      if (base_price !== undefined && (isNaN(base_price) || base_price < 0)) {
        res.status(400).json({ error: 'Base price must be a positive number' });
        return;
      }
      
      const roomType = await roomTypeService.updateRoomType(id, {
        name,
        description,
        max_guests,
        base_price
      });
      
      res.json(roomType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room type';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteRoomType(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid room type ID' });
        return;
      }
      
      const result = await roomTypeService.deleteRoomType(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room type';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }
}
