import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentService {
  async getAllPayments() {
    const payments = await prisma.payment.findMany({
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
        currency: true,
        method: true
      },
      orderBy: { created_at: 'desc' }
    });

    return payments;
  }

  async getPaymentById(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
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
        currency: true,
        method: true
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  async createPayment(data: {
    booking_id: number;
    amount: number;
    currency_id: number;
    method_id: number;
    status?: string;
    transaction_ref?: string;
  }) {
    // Validate booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: data.booking_id }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate currency exists
    const currency = await prisma.currency.findUnique({
      where: { id: data.currency_id }
    });

    if (!currency) {
      throw new Error('Currency not found');
    }

    // Validate payment method exists
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: data.method_id }
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    const payment = await prisma.payment.create({
      data: {
        booking_id: data.booking_id,
        amount: data.amount,
        currency_id: data.currency_id,
        method_id: data.method_id,
        status: data.status || 'pending',
        transaction_ref: data.transaction_ref || null
      },
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
        currency: true,
        method: true
      }
    });

    return payment;
  }

  async updatePayment(id: number, data: {
    status?: string;
    transaction_ref?: string;
  }) {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.transaction_ref !== undefined) updateData.transaction_ref = data.transaction_ref;
    
    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
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
        currency: true,
        method: true
      }
    });

    return payment;
  }

  async deletePayment(id: number) {
    const payment = await prisma.payment.delete({
      where: { id },
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
        currency: true,
        method: true
      }
    });

    return payment;
  }

  async getPaymentsByBooking(bookingId: number) {
    const payments = await prisma.payment.findMany({
      where: { booking_id: bookingId },
      include: {
        currency: true,
        method: true
      },
      orderBy: { created_at: 'desc' }
    });

    return payments;
  }

  async getPaymentsByStatus(status: string) {
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be one of: pending, completed, failed, refunded');
    }

    const payments = await prisma.payment.findMany({
      where: { status },
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
        currency: true,
        method: true
      },
      orderBy: { created_at: 'desc' }
    });

    return payments;
  }

  async getPaymentsByUser(userId: number) {
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          user_id: userId
        }
      },
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
        currency: true,
        method: true
      },
      orderBy: { created_at: 'desc' }
    });

    return payments;
  }

  async getPaymentStats() {
    const [
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      totalAmount
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'pending' } }),
      prisma.payment.count({ where: { status: 'completed' } }),
      prisma.payment.count({ where: { status: 'failed' } }),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    return {
      total: totalPayments,
      pending: pendingPayments,
      completed: completedPayments,
      failed: failedPayments,
      totalRevenue: totalAmount._sum.amount || 0
    };
  }
}
