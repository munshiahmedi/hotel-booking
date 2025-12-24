import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentMethodService {
  async getAllPaymentMethods() {
    return await prisma.paymentMethod.findMany({
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getPaymentMethodById(id: number) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    return paymentMethod;
  }

  async getPaymentMethodByName(name: string) {
    if (!name.trim()) {
      throw new Error('Payment method name is required');
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { name: name.trim() },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    return paymentMethod;
  }

  async getActivePaymentMethods() {
    return await prisma.paymentMethod.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async createPaymentMethod(data: {
    name: string;
    provider?: string;
    active?: boolean;
  }) {
    if (!data.name.trim()) {
      throw new Error('Payment method name is required');
    }

    // Check if payment method already exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { name: data.name.trim() }
    });

    if (existingPaymentMethod) {
      throw new Error('Payment method with this name already exists');
    }

    return await prisma.paymentMethod.create({
      data: {
        name: data.name.trim(),
        provider: data.provider?.trim() || null,
        active: data.active !== undefined ? data.active : true
      },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });
  }

  async updatePaymentMethod(id: number, data: {
    name?: string;
    provider?: string;
    active?: boolean;
  }) {
    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    if (!existingPaymentMethod) {
      throw new Error('Payment method not found');
    }

    // Check if name is being updated and if it already exists
    if (data.name && data.name !== existingPaymentMethod.name) {
      const nameExists = await prisma.paymentMethod.findUnique({
        where: { name: data.name.trim() }
      });

      if (nameExists) {
        throw new Error('Payment method with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error('Payment method name cannot be empty');
      }
      updateData.name = data.name.trim();
    }
    if (data.provider !== undefined) {
      updateData.provider = data.provider.trim() || null;
    }
    if (data.active !== undefined) {
      updateData.active = data.active;
    }

    return await prisma.paymentMethod.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });
  }

  async deletePaymentMethod(id: number) {
    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });

    if (!existingPaymentMethod) {
      throw new Error('Payment method not found');
    }

    // Check if payment method is in use
    if (existingPaymentMethod._count.payments > 0) {
      throw new Error('Cannot delete payment method that is in use');
    }

    await prisma.paymentMethod.delete({
      where: { id }
    });

    return { message: 'Payment method deleted successfully' };
  }

  async activatePaymentMethod(id: number) {
    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    if (!existingPaymentMethod) {
      throw new Error('Payment method not found');
    }

    return await prisma.paymentMethod.update({
      where: { id },
      data: { active: true },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });
  }

  async deactivatePaymentMethod(id: number) {
    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    if (!existingPaymentMethod) {
      throw new Error('Payment method not found');
    }

    return await prisma.paymentMethod.update({
      where: { id },
      data: { active: false },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      }
    });
  }

  async searchPaymentMethods(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.paymentMethod.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim()
            }
          },
          {
            provider: {
              contains: query.trim()
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getPaymentMethodStats() {
    const [total, activeCount, paymentMethodWithMostUsage] = await Promise.all([
      prisma.paymentMethod.count(),
      prisma.paymentMethod.count({ where: { active: true } }),
      prisma.paymentMethod.findMany({
        include: {
          _count: {
            select: {
              payments: true
            }
          }
        },
        orderBy: {
          payments: {
            _count: 'desc'
          }
        },
        take: 1
      })
    ]);

    return {
      total_payment_methods: total,
      active_payment_methods: activeCount,
      inactive_payment_methods: total - activeCount,
      payment_method_with_most_usage: paymentMethodWithMostUsage[0] || null
    };
  }

  async getPaymentMethodsByProvider(provider: string) {
    if (!provider.trim()) {
      throw new Error('Provider name is required');
    }

    return await prisma.paymentMethod.findMany({
      where: {
        provider: {
          contains: provider.trim()
        }
      },
      include: {
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
