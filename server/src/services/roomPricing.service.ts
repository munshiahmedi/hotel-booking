import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomPricingService {
  async getAllRoomPricing() {
    return await prisma.roomPricing.findMany({
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
        },
        currency: {
          select: {
            id: true,
            code: true
          }
        }
      }
    });
  }

  async getRoomPricingById(id: number) {
    const pricing = await prisma.roomPricing.findUnique({
      where: { id },
      include: {
        room_type: {
          include: {
            hotel: true
          }
        },
        currency: true
      }
    });

    if (!pricing) {
      throw new Error('Room pricing not found');
    }

    return pricing;
  }

  async getRoomPricingByRoomType(roomTypeId: number) {
    return await prisma.roomPricing.findMany({
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
        },
        currency: {
          select: {
            id: true,
            code: true
          }
        }
      },
      orderBy: {
        date_from: 'desc'
      }
    });
  }

  async getCurrentRoomPricing(roomTypeId: number, date: Date = new Date()) {
    const pricing = await prisma.roomPricing.findFirst({
      where: {
        room_type_id: roomTypeId,
        date_from: {
          lte: date
        },
        date_to: {
          gte: date
        }
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
        },
        currency: {
          select: {
            id: true,
            code: true
          }
        }
      },
      orderBy: {
        date_from: 'desc'
      }
    });

    if (!pricing) {
      throw new Error('No pricing found for this room type and date');
    }

    return pricing;
  }

  async getRoomPricingForDateRange(roomTypeId: number, startDate: Date, endDate: Date) {
    return await prisma.roomPricing.findMany({
      where: {
        room_type_id: roomTypeId,
        OR: [
          {
            date_from: {
              lte: startDate
            },
            date_to: {
              gte: startDate
            }
          },
          {
            date_from: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            date_from: {
              lte: endDate
            },
            date_to: {
              gte: endDate
            }
          }
        ]
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
        },
        currency: {
          select: {
            id: true,
            code: true
          }
        }
      },
      orderBy: {
        date_from: 'asc'
      }
    });
  }

  async createRoomPricing(data: {
    room_type_id: number;
    date_from: Date;
    date_to: Date;
    price: number;
    currency_id: number;
  }) {
    // Verify room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: data.room_type_id }
    });

    if (!roomType) {
      throw new Error('Room type not found');
    }

    // Verify currency exists
    const currency = await prisma.currency.findUnique({
      where: { id: data.currency_id }
    });

    if (!currency) {
      throw new Error('Currency not found');
    }

    // Validate date range
    if (data.date_from >= data.date_to) {
      throw new Error('Date from must be before date to');
    }

    // Check for overlapping pricing
    const overlappingPricing = await prisma.roomPricing.findFirst({
      where: {
        room_type_id: data.room_type_id,
        OR: [
          {
            date_from: {
              lte: data.date_from
            },
            date_to: {
              gte: data.date_from
            }
          },
          {
            date_from: {
              lte: data.date_to
            },
            date_to: {
              gte: data.date_to
            }
          },
          {
            date_from: {
              gte: data.date_from
            },
            date_to: {
              lte: data.date_to
            }
          }
        ]
      }
    });

    if (overlappingPricing) {
      throw new Error('Pricing already exists for this date range');
    }

    return await prisma.roomPricing.create({
      data: {
        room_type_id: data.room_type_id,
        date_from: data.date_from,
        date_to: data.date_to,
        price: data.price,
        currency_id: data.currency_id
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
        },
        currency: {
          select: {
            id: true,
            code: true
          }
        }
      }
    });
  }

  async updateRoomPricing(id: number, data: {
    date_from?: Date;
    date_to?: Date;
    price?: number;
    currency_id?: number;
  }) {
    // Check if pricing exists
    const existingPricing = await prisma.roomPricing.findUnique({
      where: { id }
    });

    if (!existingPricing) {
      throw new Error('Room pricing not found');
    }

    // Validate date range if both dates are provided
    const dateFrom = data.date_from || existingPricing.date_from;
    const dateTo = data.date_to || existingPricing.date_to;

    if (dateFrom >= dateTo) {
      throw new Error('Date from must be before date to');
    }

    // Verify currency if provided
    if (data.currency_id) {
      const currency = await prisma.currency.findUnique({
        where: { id: data.currency_id }
      });

      if (!currency) {
        throw new Error('Currency not found');
      }
    }

    return await prisma.roomPricing.update({
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
        },
        currency: {
          select: {
            id: true,
            code: true
          }
        }
      }
    });
  }

  async deleteRoomPricing(id: number) {
    // Check if pricing exists
    const existingPricing = await prisma.roomPricing.findUnique({
      where: { id }
    });

    if (!existingPricing) {
      throw new Error('Room pricing not found');
    }

    await prisma.roomPricing.delete({
      where: { id }
    });

    return { message: 'Room pricing deleted successfully' };
  }

  async deleteExpiredPricing() {
    const result = await prisma.roomPricing.deleteMany({
      where: {
        date_to: {
          lt: new Date()
        }
      }
    });

    return { 
      message: 'Expired pricing deleted successfully',
      deletedCount: result.count
    };
  }
}
