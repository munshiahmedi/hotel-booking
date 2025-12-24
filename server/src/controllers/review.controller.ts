import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';

const reviewService = new ReviewService();

export class ReviewController {
  async getAllReviews(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await reviewService.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch reviews' });
    }
  }

  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid review ID' });
        return;
      }
      
      const review = await reviewService.getReviewById(id);
      res.json(review);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch review';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  }

  async getReviewsByHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const reviews = await reviewService.getReviewsByHotel(hotelId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch hotel reviews' });
    }
  }

  async getReviewsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const reviews = await reviewService.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user reviews' });
    }
  }

  async getHotelRatingSummary(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      if (isNaN(hotelId)) {
        res.status(400).json({ error: 'Invalid hotel ID' });
        return;
      }
      
      const summary = await reviewService.getHotelRatingSummary(hotelId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch rating summary' });
    }
  }

  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const { hotel_id, user_id, rating, comment } = req.body;
      
      if (!hotel_id || !user_id || !rating) {
        res.status(400).json({ error: 'Hotel ID, user ID, and rating are required' });
        return;
      }

      if (isNaN(hotel_id) || isNaN(user_id) || isNaN(rating)) {
        res.status(400).json({ error: 'Hotel ID, user ID, and rating must be numbers' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }
      
      const review = await reviewService.createReview({
        hotel_id,
        user_id,
        rating,
        comment
      });
      
      res.status(201).json(review);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      const { rating, comment } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid review ID' });
        return;
      }

      if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) {
        res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        return;
      }
      
      const review = await reviewService.updateReview(id, {
        rating,
        comment
      });
      
      res.json(review);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '');
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid review ID' });
        return;
      }
      
      const result = await reviewService.deleteReview(id);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async addReviewImage(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = parseInt(req.params.reviewId || '');
      const { image_url } = req.body;
      
      if (isNaN(reviewId)) {
        res.status(400).json({ error: 'Invalid review ID' });
        return;
      }

      if (!image_url) {
        res.status(400).json({ error: 'Image URL is required' });
        return;
      }

      if (!image_url.trim()) {
        res.status(400).json({ error: 'Image URL cannot be empty' });
        return;
      }
      
      const image = await reviewService.addReviewImage(reviewId, image_url);
      res.status(201).json(image);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add review image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteReviewImage(req: Request, res: Response): Promise<void> {
    try {
      const imageId = parseInt(req.params.imageId || '');
      if (isNaN(imageId)) {
        res.status(400).json({ error: 'Invalid image ID' });
        return;
      }
      
      const result = await reviewService.deleteReviewImage(imageId);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review image';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async addReviewReply(req: Request, res: Response): Promise<void> {
    try {
      const reviewId = parseInt(req.params.reviewId || '');
      const { user_id, reply } = req.body;
      
      if (isNaN(reviewId)) {
        res.status(400).json({ error: 'Invalid review ID' });
        return;
      }

      if (!user_id || !reply) {
        res.status(400).json({ error: 'User ID and reply text are required' });
        return;
      }

      if (isNaN(user_id)) {
        res.status(400).json({ error: 'User ID must be a number' });
        return;
      }

      if (!reply.trim()) {
        res.status(400).json({ error: 'Reply text cannot be empty' });
        return;
      }
      
      const reviewReply = await reviewService.addReviewReply(reviewId, user_id, reply);
      res.status(201).json(reviewReply);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add review reply';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async deleteReviewReply(req: Request, res: Response): Promise<void> {
    try {
      const replyId = parseInt(req.params.replyId || '');
      if (isNaN(replyId)) {
        res.status(400).json({ error: 'Invalid reply ID' });
        return;
      }
      
      const result = await reviewService.deleteReviewReply(replyId);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review reply';
      if (errorMessage.includes('not found')) {
        res.status(404).json({ error: errorMessage });
      } else {
        res.status(400).json({ error: errorMessage });
      }
    }
  }

  async getReviewsByRating(req: Request, res: Response): Promise<void> {
    try {
      const hotelId = parseInt(req.params.hotelId || '');
      const rating = parseInt(req.params.rating || '');
      
      if (isNaN(hotelId) || isNaN(rating)) {
        res.status(400).json({ error: 'Invalid hotel ID or rating' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }
      
      const reviews = await reviewService.getReviewsByRating(hotelId, rating);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch reviews by rating' });
    }
  }

  async getTopRatedHotels(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }
      
      const hotels = await reviewService.getTopRatedHotels(limit);
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch top rated hotels' });
    }
  }
}
