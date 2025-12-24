import { PrismaClient, Hotel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateHotelData {
  name: string;
  slug: string;
  description?: string;
  star_rating?: number;
  owner_id: number;
  address?: {
    country_id: number;
    state_id: number;
    city_id: number;
    line1: string;
    zipcode: string;
  };
  policy?: {
    checkin_time?: string;
    checkout_time?: string;
    cancellation_policy?: string;
  };
}

export interface UpdateHotelData {
  name?: string;
  slug?: string;
  description?: string;
  star_rating?: number;
  status?: string;
  address?: {
    country_id: number;
    state_id: number;
    city_id: number;
    line1: string;
    zipcode: string;
  };
  policy?: {
    checkin_time?: string;
    checkout_time?: string;
    cancellation_policy?: string;
  };
}

export interface HotelFilters {
  search?: string;
  city_id?: number;
  state_id?: number;
  country_id?: number;
  star_rating?: number;
  status?: string;
  page?: number;
  limit?: number;
}

class HotelService {
  async createHotel(data: CreateHotelData): Promise<Hotel> {
    try {
      const hotel = await prisma.hotel.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          star_rating: data.star_rating || 1,
          owner_id: data.owner_id,
          ...(data.address && {
            hotel_address: {
              create: data.address
            }
          }),
          ...(data.policy && {
            hotel_policy: {
              create: data.policy
            }
          })
        },
        include: {
          hotel_address: true,
          hotel_policy: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return hotel;
    } catch (error) {
      throw new Error(`Failed to create hotel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllHotels(filters: HotelFilters = {}): Promise<{ hotels: Hotel[]; total: number; page: number; limit: number }> {
    try {
      const page = parseInt(filters.page?.toString() || '1');
      const limit = parseInt(filters.limit?.toString() || '10');
      const skip = (page - 1) * limit;

      const where: Prisma.HotelWhereInput = {};

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } }
        ];
      }

      if (filters.city_id) {
        where.hotel_address = { city_id: filters.city_id };
      }

      if (filters.state_id) {
        if (where.hotel_address) {
          where.hotel_address.state_id = filters.state_id;
        } else {
          where.hotel_address = { state_id: filters.state_id };
        }
      }

      if (filters.country_id) {
        if (where.hotel_address) {
          where.hotel_address.country_id = filters.country_id;
        } else {
          where.hotel_address = { country_id: filters.country_id };
        }
      }

      if (filters.star_rating) {
        where.star_rating = filters.star_rating;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const [hotels, total] = await Promise.all([
        prisma.hotel.findMany({
          where,
          skip,
          take: limit,
          include: {
            hotel_address: {
              include: {
                country: true,
                state: true,
                city: true
              }
            },
            hotel_policy: true,
            hotel_images: {
              where: { is_primary: true },
              take: 1
            },
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                reviews: true,
                bookings: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }),
        prisma.hotel.count({ where })
      ]);

      return {
        hotels,
        total,
        page,
        limit
      };
    } catch (error) {
      throw new Error(`Failed to fetch hotels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getHotelById(id: number): Promise<Hotel | null> {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        include: {
          hotel_address: {
            include: {
              country: true,
              state: true,
              city: true
            }
          },
          hotel_policy: true,
          hotel_images: {
            orderBy: { is_primary: 'desc' }
          },
          hotel_amenities: {
            include: {
              amenity: true
            }
          },
          hotel_facilities: {
            include: {
              facility: true
            }
          },
          room_types: {
            include: {
              room_pricing: {
                where: {
                  date_from: { lte: new Date() },
                  date_to: { gte: new Date() }
                },
                take: 1,
                orderBy: { date_from: 'desc' }
              },
              room_images: {
                where: { is_primary: true },
                take: 1
              }
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: { created_at: 'desc' },
            take: 10
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
              room_types: true
            }
          }
        }
      });
      return hotel;
    } catch (error) {
      throw new Error(`Failed to fetch hotel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateHotel(id: number, data: UpdateHotelData): Promise<Hotel> {
    try {
      const hotel = await prisma.hotel.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.star_rating && { star_rating: data.star_rating }),
          ...(data.status && { status: data.status }),
          ...(data.address && {
            hotel_address: {
              upsert: {
                create: data.address,
                update: data.address
              }
            }
          }),
          ...(data.policy && {
            hotel_policy: {
              upsert: {
                create: data.policy,
                update: data.policy
              }
            }
          })
        },
        include: {
          hotel_address: true,
          hotel_policy: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return hotel;
    } catch (error) {
      throw new Error(`Failed to update hotel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteHotel(id: number): Promise<void> {
    try {
      // Check if hotel has any bookings
      const bookingCount = await prisma.booking.count({
        where: { hotel_id: id }
      });

      if (bookingCount > 0) {
        throw new Error('Cannot delete hotel with existing bookings');
      }

      // Delete related data in correct order to respect foreign key constraints
      await prisma.$transaction(async (tx) => {
        // Delete hotel statistics
        await tx.hotelStatistic.deleteMany({
          where: { hotel_id: id }
        });

        // Delete service catalog
        await tx.serviceCatalog.deleteMany({
          where: { hotel_id: id }
        });

        // Delete hotel facilities
        await tx.hotelFacility.deleteMany({
          where: { hotel_id: id }
        });

        // Delete hotel amenities
        await tx.hotelAmenity.deleteMany({
          where: { hotel_id: id }
        });

        // Delete hotel images
        await tx.hotelImage.deleteMany({
          where: { hotel_id: id }
        });

        // Delete hotel staff
        await tx.hotelStaff.deleteMany({
          where: { hotel_id: id }
        });

        // Delete hotel policy
        await tx.hotelPolicy.deleteMany({
          where: { hotel_id: id }
        });

        // Delete hotel address
        await tx.hotelAddress.deleteMany({
          where: { hotel_id: id }
        });

        // Delete room types and related data
        const roomTypes = await tx.roomType.findMany({
          where: { hotel_id: id }
        });

        for (const roomType of roomTypes) {
          // Delete room offers
          await tx.roomOffer.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete room availability
          await tx.roomAvailability.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete room pricing
          await tx.roomPricing.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete room images
          await tx.roomImage.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete room amenities
          await tx.roomAmenity.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete room bed types
          await tx.roomBedType.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete rooms
          await tx.room.deleteMany({
            where: { room_type_id: roomType.id }
          });

          // Delete room type
          await tx.roomType.delete({
            where: { id: roomType.id }
          });
        }

        // Delete reviews
        await tx.review.deleteMany({
          where: { hotel_id: id }
        });

        // Finally delete the hotel
        await tx.hotel.delete({
          where: { id }
        });
      });
    } catch (error) {
      throw new Error(`Failed to delete hotel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getHotelsByOwner(ownerId: number): Promise<Hotel[]> {
    try {
      const hotels = await prisma.hotel.findMany({
        where: { owner_id: ownerId },
        include: {
          hotel_address: {
            include: {
              country: true,
              state: true,
              city: true
            }
          },
          hotel_images: {
            where: { is_primary: true },
            take: 1
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
              room_types: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      return hotels;
    } catch (error) {
      throw new Error(`Failed to fetch hotels by owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateHotelStatus(id: number, status: string): Promise<Hotel> {
    try {
      const hotel = await prisma.hotel.update({
        where: { id },
        data: { status },
        include: {
          hotel_address: true,
          hotel_policy: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return hotel;
    } catch (error) {
      throw new Error(`Failed to update hotel status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new HotelService();
