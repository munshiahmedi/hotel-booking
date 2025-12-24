import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CurrencyService {
  async getAllCurrencies() {
    return await prisma.currency.findMany({
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });
  }

  async getCurrencyById(id: number) {
    const currency = await prisma.currency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      }
    });

    if (!currency) {
      throw new Error('Currency not found');
    }

    return currency;
  }

  async getCurrencyByCode(code: string) {
    if (!code.trim()) {
      throw new Error('Currency code is required');
    }

    const currency = await prisma.currency.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      }
    });

    if (!currency) {
      throw new Error('Currency not found');
    }

    return currency;
  }

  async createCurrency(data: {
    code: string;
  }) {
    if (!data.code.trim()) {
      throw new Error('Currency code is required');
    }

    const code = data.code.trim().toUpperCase();

    // Check if currency already exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { code }
    });

    if (existingCurrency) {
      throw new Error('Currency with this code already exists');
    }

    return await prisma.currency.create({
      data: {
        code
      },
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      }
    });
  }

  async updateCurrency(id: number, data: {
    code?: string;
  }) {
    // Check if currency exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { id }
    });

    if (!existingCurrency) {
      throw new Error('Currency not found');
    }

    // Check if code is being updated and if it already exists
    if (data.code && data.code !== existingCurrency.code) {
      const code = data.code.trim().toUpperCase();
      const codeExists = await prisma.currency.findUnique({
        where: { code }
      });

      if (codeExists) {
        throw new Error('Currency with this code already exists');
      }

      const updateData: any = {};
      updateData.code = code;

      return await prisma.currency.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              room_pricing: true,
              payments: true
            }
          }
        }
      });
    }

    return existingCurrency;
  }

  async deleteCurrency(id: number) {
    // Check if currency exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      }
    });

    if (!existingCurrency) {
      throw new Error('Currency not found');
    }

    // Check if currency is in use
    if (existingCurrency._count.room_pricing > 0 || existingCurrency._count.payments > 0) {
      throw new Error('Cannot delete currency that is in use');
    }

    await prisma.currency.delete({
      where: { id }
    });

    return { message: 'Currency deleted successfully' };
  }

  async searchCurrencies(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.currency.findMany({
      where: {
        code: {
          contains: query.trim().toUpperCase()
        }
      },
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });
  }

  async getCurrencyStats() {
    const [total, currencyWithMostUsage] = await Promise.all([
      prisma.currency.count(),
      prisma.currency.findMany({
        include: {
          _count: {
            select: {
              room_pricing: true,
              payments: true
            }
          }
        },
        orderBy: [
          {
            room_pricing: {
              _count: 'desc'
            }
          },
          {
            payments: {
              _count: 'desc'
            }
          }
        ],
        take: 1
      })
    ]);

    return {
      total_currencies: total,
      currency_with_most_usage: currencyWithMostUsage[0] || null
    };
  }

  async getActiveCurrencies() {
    return await prisma.currency.findMany({
      where: {
        OR: [
          {
            room_pricing: {
              some: {}
            }
          },
          {
            payments: {
              some: {}
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            room_pricing: true,
            payments: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });
  }
}
