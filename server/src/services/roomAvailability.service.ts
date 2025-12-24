import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomAvailabilityService {
  async getAllRoomAvailability() {
    return await prisma.roomAvailability.findMany({
      include: {
        room_type: {
          select: {
            id: true,
            name: true,
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async getRoomAvailabilityById(id: number) {
    const availability = await prisma.roomAvailability.findUnique({
      where: { id },
      include: {
        room_type: {
          include: {
            hotel: true
          }
        }
      }
    });

    if (!availability) {
      throw new Error('Room availability not found');
    }

    return availability;
  }

  async getRoomAvailabilityByRoomType(roomTypeId: number, startDate?: Date, endDate?: Date) {
    const whereClause: any = { room_type_id: roomTypeId };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      whereClause.date = {
        gte: startDate
      };
    } else if (endDate) {
      whereClause.date = {
        lte: endDate
      };
    }

    return await prisma.roomAvailability.findMany({
      where: whereClause,
      include: {
        room_type: {
          select: {
            id: true,
            name: true,
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async getRoomAvailabilityForDate(roomTypeId: number, date: Date) {
    const availability = await prisma.roomAvailability.findUnique({
      where: {
        room_type_id_date: {
          room_type_id: roomTypeId,
          date: date
        }
      },
      include: {
        room_type: {
          include: {
            hotel: true
          }
        }
      }
    });

    return availability;
  }

  async checkAvailability(roomTypeId: number, checkIn: Date, checkOut: Date, requiredRooms: number = 1) {
    const availabilities = await prisma.roomAvailability.findMany({
      where: {
        room_type_id: roomTypeId,
        date: {
          gte: checkIn,
          lt: checkOut
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // If no availability records exist, check if room type has rooms
    if (availabilities.length === 0) {
      const roomType = await prisma.roomType.findUnique({
        where: { id: roomTypeId },
        include: {
          rooms: {
            where: { status: 'available' }
          }
        }
      });

      if (!roomType) {
        throw new Error('Room type not found');
      }

      const totalRooms = roomType.rooms.length;
      
      if (totalRooms >= requiredRooms) {
        return {
          available: true,
          totalRooms,
          availableRooms: totalRooms,
          dates: []
        };
      } else {
        return {
          available: false,
          totalRooms,
          availableRooms: totalRooms,
          dates: [],
          reason: 'Not enough rooms available'
        };
      }
    }

    // Check availability for each date
    const unavailableDates = [];
    let minAvailableRooms = Infinity;

    for (const availability of availabilities) {
      if (availability.available_rooms < requiredRooms) {
        unavailableDates.push(availability.date);
      }
      minAvailableRooms = Math.min(minAvailableRooms, availability.available_rooms);
    }

    return {
      available: unavailableDates.length === 0,
      totalRooms: availabilities[0]?.total_rooms || 0,
      availableRooms: minAvailableRooms,
      dates: unavailableDates,
      reason: unavailableDates.length > 0 ? 'Not enough rooms available on some dates' : null
    };
  }

  async createRoomAvailability(data: {
    room_type_id: number;
    date: Date;
    total_rooms: number;
    available_rooms: number;
  }) {
    // Verify room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: data.room_type_id }
    });

    if (!roomType) {
      throw new Error('Room type not found');
    }

    // Validate available rooms
    if (data.available_rooms > data.total_rooms) {
      throw new Error('Available rooms cannot be more than total rooms');
    }

    if (data.available_rooms < 0 || data.total_rooms < 0) {
      throw new Error('Room counts cannot be negative');
    }

    // Check if availability already exists for this date
    const existingAvailability = await prisma.roomAvailability.findUnique({
      where: {
        room_type_id_date: {
          room_type_id: data.room_type_id,
          date: data.date
        }
      }
    });

    if (existingAvailability) {
      throw new Error('Availability already exists for this room type and date');
    }

    return await prisma.roomAvailability.create({
      data: {
        room_type_id: data.room_type_id,
        date: data.date,
        total_rooms: data.total_rooms,
        available_rooms: data.available_rooms
      },
      include: {
        room_type: {
          select: {
            id: true,
            name: true,
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
  }

  async updateRoomAvailability(id: number, data: {
    total_rooms?: number;
    available_rooms?: number;
  }) {
    // Check if availability exists
    const existingAvailability = await prisma.roomAvailability.findUnique({
      where: { id }
    });

    if (!existingAvailability) {
      throw new Error('Room availability not found');
    }

    // Validate room counts
    const totalRooms = data.total_rooms ?? existingAvailability.total_rooms;
    const availableRooms = data.available_rooms ?? existingAvailability.available_rooms;

    if (availableRooms > totalRooms) {
      throw new Error('Available rooms cannot be more than total rooms');
    }

    if (availableRooms < 0 || totalRooms < 0) {
      throw new Error('Room counts cannot be negative');
    }

    return await prisma.roomAvailability.update({
      where: { id },
      data,
      include: {
        room_type: {
          select: {
            id: true,
            name: true,
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
  }

  async deleteRoomAvailability(id: number) {
    // Check if availability exists
    const existingAvailability = await prisma.roomAvailability.findUnique({
      where: { id }
    });

    if (!existingAvailability) {
      throw new Error('Room availability not found');
    }

    await prisma.roomAvailability.delete({
      where: { id }
    });

    return { message: 'Room availability deleted successfully' };
  }

  async bulkUpdateAvailability(roomTypeId: number, updates: Array<{
    date: Date;
    total_rooms: number;
    available_rooms: number;
  }>) {
    const results = [];

    for (const update of updates) {
      try {
        const existingAvailability = await prisma.roomAvailability.findUnique({
          where: {
            room_type_id_date: {
              room_type_id: roomTypeId,
              date: update.date
            }
          }
        });

        if (existingAvailability) {
          const updated = await prisma.roomAvailability.update({
            where: { id: existingAvailability.id },
            data: {
              total_rooms: update.total_rooms,
              available_rooms: update.available_rooms
            },
            include: {
              room_type: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });
          results.push({ action: 'updated', data: updated });
        } else {
          const created = await prisma.roomAvailability.create({
            data: {
              room_type_id: roomTypeId,
              date: update.date,
              total_rooms: update.total_rooms,
              available_rooms: update.available_rooms
            },
            include: {
              room_type: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });
          results.push({ action: 'created', data: created });
        }
      } catch (error) {
        results.push({ 
          action: 'error', 
          date: update.date, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async initializeRoomAvailability(roomTypeId: number, startDate: Date, endDate: Date, totalRooms: number) {
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        rooms: {
          where: { status: 'available' }
        }
      }
    });

    if (!roomType) {
      throw new Error('Room type not found');
    }

    const actualTotalRooms = roomType.rooms.length;
    const finalTotalRooms = Math.min(totalRooms, actualTotalRooms);

    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return await this.bulkUpdateAvailability(
      roomTypeId,
      dates.map(date => ({
        date,
        total_rooms: finalTotalRooms,
        available_rooms: finalTotalRooms
      }))
    );
  }
}
