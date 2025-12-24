import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BookingPaymentService {
  async getAllBookingPayments() {
    return await prisma.bookingPayment.findMany({
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getBookingPaymentById(id: number) {
    const payment = await prisma.bookingPayment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            hotel: true,
            room_type: true
          }
        },
        payment: {
          include: {
            currency: true,
            method: true,
            transaction_logs: true
          }
        }
      }
    });

    if (!payment) {
      throw new Error('Booking payment not found');
    }

    return payment;
  }

  async getPaymentsByBooking(bookingId: number) {
    return await prisma.bookingPayment.findMany({
      where: { booking_id: bookingId },
      include: {
        booking: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });
  }

  async createBookingPayment(data: {
    booking_id: number;
    payment_id: number;
    status: string;
  }) {
    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: data.booking_id }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: data.payment_id }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Check if payment belongs to the booking
    if (payment.booking_id !== data.booking_id) {
      throw new Error('Payment does not belong to this booking');
    }

    // Check if booking payment already exists
    const existingBookingPayment = await prisma.bookingPayment.findFirst({
      where: {
        booking_id: data.booking_id,
        payment_id: data.payment_id
      }
    });

    if (existingBookingPayment) {
      throw new Error('Booking payment already exists');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await prisma.bookingPayment.create({
      data: {
        booking_id: data.booking_id,
        payment_id: data.payment_id,
        status: data.status
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      }
    });
  }

  async updateBookingPaymentStatus(id: number, status: string) {
    // Check if booking payment exists
    const existingBookingPayment = await prisma.bookingPayment.findUnique({
      where: { id }
    });

    if (!existingBookingPayment) {
      throw new Error('Booking payment not found');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await prisma.bookingPayment.update({
      where: { id },
      data: { status },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      }
    });
  }

  async deleteBookingPayment(id: number) {
    // Check if booking payment exists
    const existingBookingPayment = await prisma.bookingPayment.findUnique({
      where: { id }
    });

    if (!existingBookingPayment) {
      throw new Error('Booking payment not found');
    }

    await prisma.bookingPayment.delete({
      where: { id }
    });

    return { message: 'Booking payment deleted successfully' };
  }

  async getPaymentSummaryByBooking(bookingId: number) {
    const bookingPayments = await prisma.bookingPayment.findMany({
      where: { booking_id: bookingId },
      include: {
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            }
          }
        }
      }
    });

    const summary = {
      booking_id: bookingId,
      total_payments: bookingPayments.length,
      total_amount: 0,
      currency_code: '',
      status_breakdown: {} as Record<string, number>,
      payments: bookingPayments.map(bp => ({
        id: bp.id,
        payment_id: bp.payment_id,
        status: bp.status,
        amount: bp.payment.amount,
        currency_code: bp.payment.currency.code,
        created_at: bp.created_at
      }))
    };

    // Calculate totals
    let totalAmount = 0;
    let currencyCode = '';

    for (const bp of bookingPayments) {
      totalAmount += Number(bp.payment.amount);
      currencyCode = bp.payment.currency.code;
      
      summary.status_breakdown[bp.status] = (summary.status_breakdown[bp.status] || 0) + 1;
    }

    summary.total_amount = totalAmount;
    summary.currency_code = currencyCode;

    return summary;
  }

  async getPaymentsByStatus(status: string) {
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await prisma.bookingPayment.findMany({
      where: { status },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getPaymentsByUser(userId: number) {
    // Get all bookings for the user
    const userBookings = await prisma.booking.findMany({
      where: { user_id: userId },
      select: { id: true }
    });

    const bookingIds = userBookings.map(b => b.id);

    if (bookingIds.length === 0) {
      return [];
    }

    return await prisma.bookingPayment.findMany({
      where: {
        booking_id: {
          in: bookingIds
        }
      },
      include: {
        booking: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true
              }
            },
            room_type: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async processPaymentRefund(id: number, refundAmount?: number) {
    // Check if booking payment exists
    const existingBookingPayment = await prisma.bookingPayment.findUnique({
      where: { id },
      include: {
        payment: true
      }
    });

    if (!existingBookingPayment) {
      throw new Error('Booking payment not found');
    }

    if (existingBookingPayment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    const paymentAmount = Number(existingBookingPayment.payment.amount);
    const refundAmountToProcess = refundAmount ? Math.min(refundAmount, paymentAmount) : paymentAmount;

    if (refundAmountToProcess <= 0) {
      throw new Error('Refund amount must be positive');
    }

    // Update booking payment status
    const updatedPayment = await prisma.bookingPayment.update({
      where: { id },
      data: { status: 'refunded' },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            hotel: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          include: {
            currency: {
              select: {
                id: true,
                code: true
              }
            },
            method: {
              select: {
                id: true,
                name: true,
                provider: true
              }
            }
          }
        }
      }
    });

    return {
      payment: updatedPayment,
      refund_amount: refundAmountToProcess,
      refund_currency: existingBookingPayment.payment.currency_id
    };
  }
}
