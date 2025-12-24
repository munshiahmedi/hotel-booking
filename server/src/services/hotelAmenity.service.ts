import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HotelAmenityService {
  async getAllHotelAmenities() {
    return await prisma.hotelAmenity.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        amenity: true
      }
    });
  }

  async getHotelAmenityById(id: number) {
    const amenity = await prisma.hotelAmenity.findUnique({
      where: { id },
      include: {
        hotel: true,
        amenity: true
      }
    });

    if (!amenity) {
      throw new Error('Hotel amenity not found');
    }

    return amenity;
  }

  async getHotelAmenitiesByHotel(hotelId: number) {
    return await prisma.hotelAmenity.findMany({
      where: { hotel_id: hotelId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        amenity: true
      },
      orderBy: {
        amenity: {
          name: 'asc'
        }
      }
    });
  }

  async getAmenitiesMaster() {
    return await prisma.amenitiesMaster.findMany({
      include: {
        hotel_amenities: {
          select: {
            hotel_id: true
          }
        }
      }
    });
  }

  async getAmenityMasterById(id: number) {
    const amenity = await prisma.amenitiesMaster.findUnique({
      where: { id },
      include: {
        hotel_amenities: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!amenity) {
      throw new Error('Amenity not found');
    }

    return amenity;
  }

  async createHotelAmenity(data: {
    hotel_id: number;
    amenity_id: number;
  }) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotel_id }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Verify amenity exists
    const amenity = await prisma.amenitiesMaster.findUnique({
      where: { id: data.amenity_id }
    });

    if (!amenity) {
      throw new Error('Amenity not found');
    }

    // Check if amenity already assigned to hotel
    const existingAssignment = await prisma.hotelAmenity.findUnique({
      where: {
        hotel_id_amenity_id: {
          hotel_id: data.hotel_id,
          amenity_id: data.amenity_id
        }
      }
    });

    if (existingAssignment) {
      throw new Error('Amenity already assigned to this hotel');
    }

    return await prisma.hotelAmenity.create({
      data: {
        hotel_id: data.hotel_id,
        amenity_id: data.amenity_id
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        amenity: true
      }
    });
  }

  async createAmenityMaster(data: {
    name: string;
    icon?: string;
    description?: string;
  }) {
    // Check if amenity name already exists
    const existingAmenity = await prisma.amenitiesMaster.findUnique({
      where: { name: data.name }
    });

    if (existingAmenity) {
      throw new Error('Amenity with this name already exists');
    }

    if (!data.name.trim()) {
      throw new Error('Amenity name is required');
    }

    return await prisma.amenitiesMaster.create({
      data: {
        name: data.name.trim(),
        icon: data.icon?.trim() || null,
        description: data.description?.trim() || null
      }
    });
  }

  async deleteHotelAmenity(id: number) {
    // Check if hotel amenity exists
    const existingHotelAmenity = await prisma.hotelAmenity.findUnique({
      where: { id }
    });

    if (!existingHotelAmenity) {
      throw new Error('Hotel amenity not found');
    }

    await prisma.hotelAmenity.delete({
      where: { id }
    });

    return { message: 'Hotel amenity deleted successfully' };
  }

  async deleteAmenityMaster(id: number) {
    // Check if amenity exists
    const existingAmenity = await prisma.amenitiesMaster.findUnique({
      where: { id },
      include: {
        hotel_amenities: true,
        room_amenities: true
      }
    });

    if (!existingAmenity) {
      throw new Error('Amenity not found');
    }

    // Check if amenity is in use
    if (existingAmenity.hotel_amenities.length > 0 || existingAmenity.room_amenities.length > 0) {
      throw new Error('Cannot delete amenity that is in use by hotels or rooms');
    }

    await prisma.amenitiesMaster.delete({
      where: { id }
    });

    return { message: 'Amenity deleted successfully' };
  }

  async bulkAssignAmenitiesToHotel(hotelId: number, amenityIds: number[]) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (!Array.isArray(amenityIds) || amenityIds.length === 0) {
      throw new Error('Amenity IDs array is required');
    }

    const results = [];

    for (const amenityId of amenityIds) {
      try {
        // Check if amenity exists
        const amenity = await prisma.amenitiesMaster.findUnique({
          where: { id: amenityId }
        });

        if (!amenity) {
          results.push({ 
            success: false, 
            amenityId, 
            error: 'Amenity not found' 
          });
          continue;
        }

        // Check if already assigned
        const existingAssignment = await prisma.hotelAmenity.findUnique({
          where: {
            hotel_id_amenity_id: {
              hotel_id: hotelId,
              amenity_id: amenityId
            }
          }
        });

        if (existingAssignment) {
          results.push({ 
            success: false, 
            amenityId, 
            error: 'Amenity already assigned to hotel' 
          });
          continue;
        }

        // Create assignment
        const assignment = await prisma.hotelAmenity.create({
          data: {
            hotel_id: hotelId,
            amenity_id: amenityId
          },
          include: {
            hotel: {
              select: {
                id: true,
                name: true
              }
            },
            amenity: true
          }
        });

        results.push({ success: true, data: assignment });
      } catch (error) {
        results.push({ 
          success: false, 
          amenityId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async bulkRemoveAmenitiesFromHotel(hotelId: number, amenityIds: number[]) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (!Array.isArray(amenityIds) || amenityIds.length === 0) {
      throw new Error('Amenity IDs array is required');
    }

    const results = [];

    for (const amenityId of amenityIds) {
      try {
        const assignment = await prisma.hotelAmenity.findUnique({
          where: {
            hotel_id_amenity_id: {
              hotel_id: hotelId,
              amenity_id: amenityId
            }
          }
        });

        if (!assignment) {
          results.push({ 
            success: false, 
            amenityId, 
            error: 'Amenity not assigned to hotel' 
          });
          continue;
        }

        await prisma.hotelAmenity.delete({
          where: { id: assignment.id }
        });

        results.push({ success: true, amenityId });
      } catch (error) {
        results.push({ 
          success: false, 
          amenityId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async updateAmenityMaster(id: number, data: {
    name?: string;
    icon?: string;
    description?: string;
  }) {
    // Check if amenity exists
    const existingAmenity = await prisma.amenitiesMaster.findUnique({
      where: { id }
    });

    if (!existingAmenity) {
      throw new Error('Amenity not found');
    }

    // Check if name is being updated and if it already exists
    if (data.name && data.name !== existingAmenity.name) {
      const nameExists = await prisma.amenitiesMaster.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        throw new Error('Amenity with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.icon !== undefined) updateData.icon = data.icon.trim() || null;
    if (data.description !== undefined) updateData.description = data.description.trim() || null;

    return await prisma.amenitiesMaster.update({
      where: { id },
      data: updateData
    });
  }
}
