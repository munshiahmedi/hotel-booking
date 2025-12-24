import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HotelFacilityService {
  async getAllHotelFacilities() {
    return await prisma.hotelFacility.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        facility: true
      }
    });
  }

  async getHotelFacilityById(id: number) {
    const facility = await prisma.hotelFacility.findUnique({
      where: { id },
      include: {
        hotel: true,
        facility: true
      }
    });

    if (!facility) {
      throw new Error('Hotel facility not found');
    }

    return facility;
  }

  async getHotelFacilitiesByHotel(hotelId: number) {
    return await prisma.hotelFacility.findMany({
      where: { hotel_id: hotelId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        facility: true
      },
      orderBy: {
        facility: {
          name: 'asc'
        }
      }
    });
  }

  async getFacilitiesMaster() {
    return await prisma.facilitiesMaster.findMany({
      include: {
        hotel_facilities: {
          select: {
            hotel_id: true
          }
        }
      }
    });
  }

  async getFacilityMasterById(id: number) {
    const facility = await prisma.facilitiesMaster.findUnique({
      where: { id },
      include: {
        hotel_facilities: {
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

    if (!facility) {
      throw new Error('Facility not found');
    }

    return facility;
  }

  async createHotelFacility(data: {
    hotel_id: number;
    facility_id: number;
  }) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: data.hotel_id }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Verify facility exists
    const facility = await prisma.facilitiesMaster.findUnique({
      where: { id: data.facility_id }
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    // Check if facility already assigned to hotel
    const existingAssignment = await prisma.hotelFacility.findUnique({
      where: {
        hotel_id_facility_id: {
          hotel_id: data.hotel_id,
          facility_id: data.facility_id
        }
      }
    });

    if (existingAssignment) {
      throw new Error('Facility already assigned to this hotel');
    }

    return await prisma.hotelFacility.create({
      data: {
        hotel_id: data.hotel_id,
        facility_id: data.facility_id
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        },
        facility: true
      }
    });
  }

  async createFacilityMaster(data: {
    name: string;
    icon?: string;
    description?: string;
  }) {
    // Check if facility name already exists
    const existingFacility = await prisma.facilitiesMaster.findUnique({
      where: { name: data.name }
    });

    if (existingFacility) {
      throw new Error('Facility with this name already exists');
    }

    if (!data.name.trim()) {
      throw new Error('Facility name is required');
    }

    return await prisma.facilitiesMaster.create({
      data: {
        name: data.name.trim(),
        icon: data.icon?.trim() || null,
        description: data.description?.trim() || null
      }
    });
  }

  async deleteHotelFacility(id: number) {
    // Check if hotel facility exists
    const existingHotelFacility = await prisma.hotelFacility.findUnique({
      where: { id }
    });

    if (!existingHotelFacility) {
      throw new Error('Hotel facility not found');
    }

    await prisma.hotelFacility.delete({
      where: { id }
    });

    return { message: 'Hotel facility deleted successfully' };
  }

  async deleteFacilityMaster(id: number) {
    // Check if facility exists
    const existingFacility = await prisma.facilitiesMaster.findUnique({
      where: { id },
      include: {
        hotel_facilities: true
      }
    });

    if (!existingFacility) {
      throw new Error('Facility not found');
    }

    // Check if facility is in use
    if (existingFacility.hotel_facilities.length > 0) {
      throw new Error('Cannot delete facility that is in use by hotels');
    }

    await prisma.facilitiesMaster.delete({
      where: { id }
    });

    return { message: 'Facility deleted successfully' };
  }

  async bulkAssignFacilitiesToHotel(hotelId: number, facilityIds: number[]) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (!Array.isArray(facilityIds) || facilityIds.length === 0) {
      throw new Error('Facility IDs array is required');
    }

    const results = [];

    for (const facilityId of facilityIds) {
      try {
        // Check if facility exists
        const facility = await prisma.facilitiesMaster.findUnique({
          where: { id: facilityId }
        });

        if (!facility) {
          results.push({ 
            success: false, 
            facilityId, 
            error: 'Facility not found' 
          });
          continue;
        }

        // Check if already assigned
        const existingAssignment = await prisma.hotelFacility.findUnique({
          where: {
            hotel_id_facility_id: {
              hotel_id: hotelId,
              facility_id: facilityId
            }
          }
        });

        if (existingAssignment) {
          results.push({ 
            success: false, 
            facilityId, 
            error: 'Facility already assigned to hotel' 
          });
          continue;
        }

        // Create assignment
        const assignment = await prisma.hotelFacility.create({
          data: {
            hotel_id: hotelId,
            facility_id: facilityId
          },
          include: {
            hotel: {
              select: {
                id: true,
                name: true
              }
            },
            facility: true
          }
        });

        results.push({ success: true, data: assignment });
      } catch (error) {
        results.push({ 
          success: false, 
          facilityId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async bulkRemoveFacilitiesFromHotel(hotelId: number, facilityIds: number[]) {
    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    if (!Array.isArray(facilityIds) || facilityIds.length === 0) {
      throw new Error('Facility IDs array is required');
    }

    const results = [];

    for (const facilityId of facilityIds) {
      try {
        const assignment = await prisma.hotelFacility.findUnique({
          where: {
            hotel_id_facility_id: {
              hotel_id: hotelId,
              facility_id: facilityId
            }
          }
        });

        if (!assignment) {
          results.push({ 
            success: false, 
            facilityId, 
            error: 'Facility not assigned to hotel' 
          });
          continue;
        }

        await prisma.hotelFacility.delete({
          where: { id: assignment.id }
        });

        results.push({ success: true, facilityId });
      } catch (error) {
        results.push({ 
          success: false, 
          facilityId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async updateFacilityMaster(id: number, data: {
    name?: string;
    icon?: string;
    description?: string;
  }) {
    // Check if facility exists
    const existingFacility = await prisma.facilitiesMaster.findUnique({
      where: { id }
    });

    if (!existingFacility) {
      throw new Error('Facility not found');
    }

    // Check if name is being updated and if it already exists
    if (data.name && data.name !== existingFacility.name) {
      const nameExists = await prisma.facilitiesMaster.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        throw new Error('Facility with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.icon !== undefined) updateData.icon = data.icon.trim() || null;
    if (data.description !== undefined) updateData.description = data.description.trim() || null;

    return await prisma.facilitiesMaster.update({
      where: { id },
      data: updateData
    });
  }

  async searchFacilities(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.facilitiesMaster.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim()
            }
          },
          {
            description: {
              contains: query.trim()
            }
          }
        ]
      },
      include: {
        hotel_facilities: {
          select: {
            hotel_id: true
          }
        }
      }
    });
  }

  async getHotelFacilitiesSummary(hotelId: number) {
    const facilities = await prisma.hotelFacility.findMany({
      where: { hotel_id: hotelId },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            icon: true,
            description: true
          }
        }
      }
    });

    return {
      hotel_id: hotelId,
      total_facilities: facilities.length,
      facilities: facilities.map(hf => hf.facility)
    };
  }
}
