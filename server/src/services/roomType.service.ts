import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomTypeService {
  async getAllRoomTypes() {
    return await prisma.roomType.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        rooms: {
          select: {
            id: true,
            room_number: true,
            status: true
          }
        },
        room_amenities: {
          include: {
            amenity: true
          }
        },
        room_images: {
          select: {
            id: true,
            image_url: true,
            is_primary: true
          }
        }
      }
    });
  }

  async getRoomTypeById(id: number) {
    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        hotel: true,
        rooms: true,
        room_amenities: {
          include: {
            amenity: true
          }
        },
        room_images: true,
        room_pricing: {
          orderBy: {
            date_from: 'desc'
          }
        },
        room_availability: {
          orderBy: {
            date: 'asc'
          }
        },
        room_offers: {
          where: {
            valid_from: {
              lte: new Date()
            },
            valid_to: {
              gte: new Date()
            }
          }
        }
      }
    });

    if (!roomType) {
      throw new Error('Room type not found');
    }

    return roomType;
  }

  async getRoomTypesByHotel(hotelId: number) {
    return await prisma.roomType.findMany({
      where: { hotel_id: hotelId },
      include: {
        rooms: {
          select: {
            id: true,
            room_number: true,
            status: true
          }
        },
        room_pricing: {
          where: {
            date_from: {
              lte: new Date()
            }
          },
          orderBy: {
            date_from: 'desc'
          },
          take: 1
        },
        room_images: {
          select: {
            id: true,
            image_url: true,
            is_primary: true
          },
          take: 3
        }
      }
    });
  }

  async createRoomType(data: {
    hotel_id: number;
    name: string;
    description?: string;
    max_guests: number;
    base_price: number;
  }) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotel_id }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return await prisma.roomType.create({
      data: {
        hotel_id: data.hotel_id,
        name: data.name,
        description: data.description || null,
        max_guests: data.max_guests,
        base_price: data.base_price
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

  async updateRoomType(id: number, data: {
    name?: string;
    description?: string;
    max_guests?: number;
    base_price?: number;
  }) {
    // Check if room type exists
    const existingRoomType = await prisma.roomType.findUnique({
      where: { id }
    });

    if (!existingRoomType) {
      throw new Error('Room type not found');
    }

    return await prisma.roomType.update({
      where: { id },
      data,
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

  async deleteRoomType(id: number) {
    // Check if room type exists
    const existingRoomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        rooms: true,
        bookings: true
      }
    });

    if (!existingRoomType) {
      throw new Error('Room type not found');
    }

    // Check if room type has rooms or bookings
    if (existingRoomType.rooms.length > 0) {
      throw new Error('Cannot delete room type with existing rooms');
    }

    if (existingRoomType.bookings.length > 0) {
      throw new Error('Cannot delete room type with existing bookings');
    }

    await prisma.roomType.delete({
      where: { id }
    });

    return { message: 'Room type deleted successfully' };
  }

  async getAvailableRoomTypes(hotelId: number, checkIn: Date, checkOut: Date) {
    return await prisma.roomType.findMany({
      where: {
        hotel_id: hotelId,
        rooms: {
          some: {
            status: 'available'
          }
        },
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        rooms: {
          where: {
            status: 'available'
          }
        },
        room_pricing: {
          where: {
            date_from: {
              lte: checkIn
            }
          },
          orderBy: {
            date_from: 'desc'
          },
          take: 1
        },
        room_images: {
          select: {
            id: true,
            image_url: true,
            is_primary: true
          },
          take: 3
        }
      }
    });
  }
}
