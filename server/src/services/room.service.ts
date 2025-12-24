import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomService {
  async getAllRooms() {
    return await prisma.room.findMany({
      include: {
        room_type: {
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
  }

  async getRoomById(id: number) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        room_type: {
          include: {
            hotel: true,
            room_amenities: {
              include: {
                amenity: true
              }
            },
            room_images: true,
            room_bed_types: {
              include: {
                bed_type: true
              }
            }
          }
        }
      }
    });

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  async getRoomsByRoomType(roomTypeId: number) {
    return await prisma.room.findMany({
      where: { room_type_id: roomTypeId },
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

  async getRoomsByHotel(hotelId: number) {
    return await prisma.room.findMany({
      where: {
        room_type: {
          hotel_id: hotelId
        }
      },
      include: {
        room_type: {
          select: {
            id: true,
            name: true,
            max_guests: true,
            base_price: true
          }
        }
      }
    });
  }

  async createRoom(data: {
    room_type_id: number;
    room_number: string;
    floor?: string;
    status?: string;
  }) {
    // Verify room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: data.room_type_id }
    });

    if (!roomType) {
      throw new Error('Room type not found');
    }

    // Check if room number already exists for this room type
    const existingRoom = await prisma.room.findUnique({
      where: {
        room_type_id_room_number: {
          room_type_id: data.room_type_id,
          room_number: data.room_number
        }
      }
    });

    if (existingRoom) {
      throw new Error('Room number already exists for this room type');
    }

    return await prisma.room.create({
      data: {
        room_type_id: data.room_type_id,
        room_number: data.room_number,
        floor: data.floor ? Number(data.floor) : null,
        status: data.status || 'available'
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

  async updateRoom(id: number, data: {
    room_number?: string;
    floor?: string;
    status?: string;
  }) {
    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      throw new Error('Room not found');
    }

    // If updating room number, check for duplicates
    if (data.room_number && data.room_number !== existingRoom.room_number) {
      const duplicateRoom = await prisma.room.findUnique({
        where: {
          room_type_id_room_number: {
            room_type_id: existingRoom.room_type_id,
            room_number: data.room_number
          }
        }
      });

      if (duplicateRoom) {
        throw new Error('Room number already exists for this room type');
      }
    }

    return await prisma.room.update({
      where: { id },
      data: {
        ...data,
        floor: data.floor ? Number(data.floor) : null,
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

  async deleteRoom(id: number) {
    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        room_type: {
          include: {
            bookings: true
          }
        }
      }
    });

    if (!existingRoom) {
      throw new Error('Room not found');
    }

    // Check if room has associated bookings
    if (existingRoom.room_type.bookings.length > 0) {
      throw new Error('Cannot delete room with existing bookings');
    }

    await prisma.room.delete({
      where: { id }
    });

    return { message: 'Room deleted successfully' };
  }

  async getAvailableRooms(roomTypeId: number, checkIn: Date, checkOut: Date) {
    return await prisma.room.findMany({
      where: {
        room_type_id: roomTypeId,
        status: 'available'
      },
      include: {
        room_type: {
          select: {
            id: true,
            name: true,
            max_guests: true,
            base_price: true
          }
        }
      }
    });
  }

  async updateRoomStatus(id: number, status: string) {
    const validStatuses = ['available', 'maintenance'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid room status. Must be available or maintenance');
    }

    const room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      throw new Error('Room not found');
    }

    return await prisma.room.update({
      where: { id },
      data: { status },
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

  async getRoomsByStatus(status: string) {
    const validStatuses = ['available', 'maintenance'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid room status. Must be available or maintenance');
    }

    return await prisma.room.findMany({
      where: { status },
      include: {
        room_type: {
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
  }
}
