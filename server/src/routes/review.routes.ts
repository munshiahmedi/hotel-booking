import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

// Public routes - no authentication required for viewing
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.get('/hotel/:hotelId', reviewController.getReviewsByHotel);
router.get('/hotel/:hotelId/summary', reviewController.getHotelRatingSummary);
router.get('/hotel/:hotelId/rating/:rating', reviewController.getReviewsByRating);
router.get('/top-rated', reviewController.getTopRatedHotels);

// Protected routes - authentication required
router.use(authenticateToken);

// Get reviews by user (user can see their own reviews, admin can see all)
router.get('/user/:userId', reviewController.getReviewsByUser);

// Create review (authenticated users only)
router.post('/', reviewController.createReview);

// Update review (review owner or admin only)
router.put('/:id', reviewController.updateReview);

// Delete review (review owner or admin only)
router.delete('/:id', reviewController.deleteReview);

// Add review image (review owner or admin only)
router.post('/:reviewId/images', reviewController.addReviewImage);

// Delete review image (review owner or admin only)
router.delete('/images/:imageId', reviewController.deleteReviewImage);

// Add review reply (authenticated users only)
router.post('/:reviewId/replies', reviewController.addReviewReply);

// Delete review reply (reply owner or admin only)
router.delete('/replies/:replyId', reviewController.deleteReviewReply);

export default router;
