import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HotelImageService {
  async getAllHotelImages() {
    return await prisma.hotelImage.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        is_primary: 'desc'
      }
    });
  }

  async getHotelImageById(id: number) {
    const image = await prisma.hotelImage.findUnique({
      where: { id },
      include: {
        hotel: true
      }
    });

    if (!image) {
      throw new Error('Hotel image not found');
    }

    return image;
  }

  async getHotelImagesByHotel(hotelId: number) {
    return await prisma.hotelImage.findMany({
      where: { hotel_id: hotelId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        is_primary: 'desc'
      }
    });
  }

  async getPrimaryHotelImage(hotelId: number) {
    const image = await prisma.hotelImage.findFirst({
      where: { 
        hotel_id: hotelId,
        is_primary: true 
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return image;
  }

  async createHotelImage(data: {
    hotel_id: number;
    image_url: string;
    is_primary?: boolean;
  }) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotel_id }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Validate image URL
    if (!data.image_url.trim()) {
      throw new Error('Image URL is required');
    }

    // If setting as primary, unset existing primary
    if (data.is_primary) {
      await prisma.hotelImage.updateMany({
        where: { 
          hotel_id: data.hotel_id,
          is_primary: true 
        },
        data: { is_primary: false }
      });
    }

    return await prisma.hotelImage.create({
      data: {
        hotel_id: data.hotel_id,
        image_url: data.image_url.trim(),
        is_primary: data.is_primary || false
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async updateHotelImage(id: number, data: {
    image_url?: string;
    is_primary?: boolean;
  }) {
    // Check if image exists
    const existingImage = await prisma.hotelImage.findUnique({
      where: { id }
    });

    if (!existingImage) {
      throw new Error('Hotel image not found');
    }

    // Validate image URL if provided
    if (data.image_url !== undefined && !data.image_url.trim()) {
      throw new Error('Image URL cannot be empty');
    }

    // If setting as primary, unset existing primary for this hotel
    if (data.is_primary && !existingImage.is_primary) {
      await prisma.hotelImage.updateMany({
        where: { 
          hotel_id: existingImage.hotel_id,
          is_primary: true 
        },
        data: { is_primary: false }
      });
    }

    const updateData: any = {};
    if (data.image_url !== undefined) updateData.image_url = data.image_url.trim();
    if (data.is_primary !== undefined) updateData.is_primary = data.is_primary;

    return await prisma.hotelImage.update({
      where: { id },
      data: updateData,
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async setPrimaryImage(id: number) {
    // Check if image exists
    const existingImage = await prisma.hotelImage.findUnique({
      where: { id }
    });

    if (!existingImage) {
      throw new Error('Hotel image not found');
    }

    // Unset existing primary
    await prisma.hotelImage.updateMany({
      where: { 
        hotel_id: existingImage.hotel_id,
        is_primary: true 
      },
      data: { is_primary: false }
    });

    // Set new primary
    return await prisma.hotelImage.update({
      where: { id },
      data: { is_primary: true },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async deleteHotelImage(id: number) {
    // Check if image exists
    const existingImage = await prisma.hotelImage.findUnique({
      where: { id }
    });

    if (!existingImage) {
      throw new Error('Hotel image not found');
    }

    // Check if it's the only image for the hotel
    const imageCount = await prisma.hotelImage.count({
      where: { hotel_id: existingImage.hotel_id }
    });

    if (imageCount === 1) {
      throw new Error('Cannot delete the only image for a hotel');
    }

    // If deleting primary image, set another as primary
    if (existingImage.is_primary) {
      const anotherImage = await prisma.hotelImage.findFirst({
        where: { 
          hotel_id: existingImage.hotel_id,
          id: { not: id }
        }
      });

      if (anotherImage) {
        await prisma.hotelImage.update({
          where: { id: anotherImage.id },
          data: { is_primary: true }
        });
      }
    }

    await prisma.hotelImage.delete({
      where: { id }
    });

    return { message: 'Hotel image deleted successfully' };
  }

  async bulkUploadHotelImages(hotelId: number, imageUrls: string[]) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('Image URLs array is required');
    }

    // Validate URLs
    for (const url of imageUrls) {
      if (!url || !url.trim()) {
        throw new Error('All image URLs must be non-empty strings');
      }
    }

    const results = [];
    let primarySet = false;

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const isPrimary = i === 0 && !primarySet; // First image as primary if none set
        
        const image = await prisma.hotelImage.create({
          data: {
            hotel_id: hotelId,
            image_url: imageUrls[i]?.trim() || '',
            is_primary: isPrimary
          },
          include: {
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (isPrimary) primarySet = true;
        results.push({ success: true, data: image });
      } catch (error) {
        results.push({ 
          success: false, 
          url: imageUrls[i] || 'undefined', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async reorderHotelImages(hotelId: number, imageIds: number[]) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      throw new Error('Image IDs array is required');
    }

    // Verify all images belong to this hotel
    const images = await prisma.hotelImage.findMany({
      where: { 
        hotel_id: hotelId,
        id: { in: imageIds }
      }
    });

    if (images.length !== imageIds.length) {
      throw new Error('Some images do not belong to this hotel');
    }

    // For reordering, we would typically add an order field to the schema
    // Since we don't have that, we'll just return the images in the requested order
    const orderedImages = imageIds.map(id => 
      images.find(img => img.id === id)
    ).filter(Boolean);

    return orderedImages;
  }
}
