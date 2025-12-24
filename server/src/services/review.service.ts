import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReviewService {
  async getAllReviews() {
    return await prisma.review.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        review_images: true,
        review_replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getReviewById(id: number) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        hotel: true,
        user: true,
        review_images: true,
        review_replies: {
          include: {
            user: true
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  async getReviewsByHotel(hotelId: number) {
    return await prisma.review.findMany({
      where: { hotel_id: hotelId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        },
        review_images: true,
        review_replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getReviewsByUser(userId: number) {
    return await prisma.review.findMany({
      where: { user_id: userId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        },
        review_images: true,
        review_replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getHotelRatingSummary(hotelId: number) {
    const reviews = await prisma.review.findMany({
      where: { hotel_id: hotelId },
      select: {
        rating: true
      }
    });

    if (reviews.length === 0) {
      return {
        hotel_id: hotelId,
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      }
    });

    return {
      hotel_id: hotelId,
      total_reviews: totalReviews,
      average_rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      rating_distribution: ratingDistribution
    };
  }

  async createReview(data: {
    hotel_id: number;
    user_id: number;
    rating: number;
    comment?: string;
  }) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotel_id }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.user_id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already reviewed this hotel
    const existingReview = await prisma.review.findUnique({
      where: {
        hotel_id_user_id: {
          hotel_id: data.hotel_id,
          user_id: data.user_id
        }
      }
    });

    if (existingReview) {
      throw new Error('User has already reviewed this hotel');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return await prisma.review.create({
      data: {
        hotel_id: data.hotel_id,
        user_id: data.user_id,
        rating: data.rating,
        comment: data.comment?.trim() || null
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        review_images: true,
        review_replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });
  }

  async updateReview(id: number, data: {
    rating?: number;
    comment?: string;
  }) {
    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment?.trim() || null;

    return await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        review_images: true,
        review_replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });
  }

  async deleteReview(id: number) {
    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    await prisma.review.delete({
      where: { id }
    });

    return { message: 'Review deleted successfully' };
  }

  async addReviewImage(reviewId: number, imageUrl: string) {
    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (!imageUrl.trim()) {
      throw new Error('Image URL is required');
    }

    return await prisma.reviewImage.create({
      data: {
        review_id: reviewId,
        image_url: imageUrl.trim()
      }
    });
  }

  async deleteReviewImage(imageId: number) {
    // Check if image exists
    const existingImage = await prisma.reviewImage.findUnique({
      where: { id: imageId }
    });

    if (!existingImage) {
      throw new Error('Review image not found');
    }

    await prisma.reviewImage.delete({
      where: { id: imageId }
    });

    return { message: 'Review image deleted successfully' };
  }

  async addReviewReply(reviewId: number, userId: number, reply: string) {
    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!reply.trim()) {
      throw new Error('Reply text is required');
    }

    return await prisma.reviewReply.create({
      data: {
        review_id: reviewId,
        user_id: userId,
        reply: reply.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async deleteReviewReply(replyId: number) {
    // Check if reply exists
    const existingReply = await prisma.reviewReply.findUnique({
      where: { id: replyId }
    });

    if (!existingReply) {
      throw new Error('Review reply not found');
    }

    await prisma.reviewReply.delete({
      where: { id: replyId }
    });

    return { message: 'Review reply deleted successfully' };
  }

  async getReviewsByRating(hotelId: number, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return await prisma.review.findMany({
      where: {
        hotel_id: hotelId,
        rating: rating
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        },
        review_images: true,
        review_replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getTopRatedHotels(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const hotels = await prisma.hotel.findMany({
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    const hotelsWithRatings = hotels.map(hotel => {
      const totalReviews = hotel.reviews.length;
      const averageRating = totalReviews > 0 
        ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      return {
        id: hotel.id,
        name: hotel.name,
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 100) / 100
      };
    });

    // Filter hotels with at least 1 review and sort by rating
    return hotelsWithRatings
      .filter(hotel => hotel.total_reviews > 0)
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, limit);
  }
}
