import { Request, Response } from 'express';
import { HotelImageService } from '../services/hotelImage.service';

const hotelImageService = new HotelImageService();

export class HotelImageController {
  async getAllHotelImages(req: Request, res: Response): Promise<void> {
    try {
      const images = await hotelImageService.getAllHotelImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel images' });
    }
  }

  async getHotelImageById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid image ID' });
        return;
      }
      
      const image = await hotelImageService.getHotelImageById(id);
      res.json(image);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hotel image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getHotelImagesByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const images = await hotelImageService.getHotelImagesByHotel(hotelId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel images' });
    }
  }

  async getPrimaryHotelImage(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const image = await hotelImageService.getPrimaryHotelImage(hotelId);
      
      if (!image) {
        res.status(404).json({ error: 'No primary image found for this hotel' });
        return;
      }
      
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch primary hotel image' });
    }
  }

  async createHotelImage(req: Request, res: Response): Promise<void> {
    try {
      const { hotel_id, image_url, is_primary } = req.body;
      
      if (!hotel_id || !image_url) {
        res.status(400).json({ error: 'Hotel ID and image URL are required' });
        return;
      }

      if (isNaN(hotel_id)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!image_url.trim()) {
        res.status(400).json({ error: 'Image URL cannot be empty' });
        return;
      }
      
      const image = await hotelImageService.createHotelImage({
        hotel_id,
        image_url: image_url.trim(),
        is_primary
      });
      
      res.status(201).json(image);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create hotel image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateHotelImage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { image_url, is_primary } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid image ID' });
        return;
      }

      if (image_url !== undefined && !image_url.trim()) {
        res.status(400).json({ error: 'Image URL cannot be empty' });
        return;
      }

      const updateData: any = {};
      if (image_url !== undefined) updateData.image_url = image_url.trim();
      if (is_primary !== undefined) updateData.is_primary = is_primary;
      
      const image = await hotelImageService.updateHotelImage(id, updateData);
      res.json(image);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hotel image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async setPrimaryImage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid image ID' });
        return;
      }
      
      const image = await hotelImageService.setPrimaryImage(id);
      res.json(image);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set primary image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteHotelImage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid image ID' });
        return;
      }
      
      const result = await hotelImageService.deleteHotelImage(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hotel image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async bulkUploadHotelImages(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId, imageUrls } = req.body;
      
      if (!hotelId || !imageUrls) {
        res.status(400).json({ error: 'Hotel ID and image URLs are required' });
        return;
      }

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!Array.isArray(imageUrls)) {
        res.status(400).json({ error: 'Image URLs must be an array' });
        return;
      }

      if (imageUrls.length === 0) {
        res.status(400).json({ error: 'At least one image URL is required' });
        return;
      }
      
      const results = await hotelImageService.bulkUploadHotelImages(hotelId, imageUrls);
      res.json(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk upload hotel images';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async reorderHotelImages(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId, imageIds } = req.body;
      
      if (!hotelId || !imageIds) {
        res.status(400).json({ error: 'Hotel ID and image IDs are required' });
        return;
      }

      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Hotel ID must be a number' });
        return;
      }

      if (!Array.isArray(imageIds)) {
        res.status(400).json({ error: 'Image IDs must be an array' });
        return;
      }

      if (imageIds.length === 0) {
        res.status(400).json({ error: 'At least one image ID is required' });
        return;
      }
      
      const images = await hotelImageService.reorderHotelImages(hotelId, imageIds);
      res.json(images);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder hotel images';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }
}
