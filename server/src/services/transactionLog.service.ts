import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionLogService {
  async getAllTransactionLogs() {
    return await prisma.transactionLog.findMany({
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async getTransactionLogById(id: number) {
    const transactionLog = await prisma.transactionLog.findUnique({
      where: { id },
      include: {
        payment: true
      }
    });

    if (!transactionLog) {
      throw new Error('Transaction log not found');
    }

    return transactionLog;
  }

  async getTransactionLogsByPayment(paymentId: number) {
    return await prisma.transactionLog.findMany({
      where: { payment_id: paymentId },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async getTransactionLogsByStatus(status: string) {
    if (!status.trim()) {
      throw new Error('Status is required');
    }

    return await prisma.transactionLog.findMany({
      where: { status: status.trim() },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async createTransactionLog(data: {
    payment_id: number;
    status: string;
    raw_response?: string;
  }) {
    // Verify payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: data.payment_id }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!data.status.trim()) {
      throw new Error('Status is required');
    }

    return await prisma.transactionLog.create({
      data: {
        payment_id: data.payment_id,
        status: data.status.trim(),
        raw_response: data.raw_response?.trim() || null
      },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async deleteTransactionLog(id: number) {
    // Check if transaction log exists
    const existingTransactionLog = await prisma.transactionLog.findUnique({
      where: { id }
    });

    if (!existingTransactionLog) {
      throw new Error('Transaction log not found');
    }

    await prisma.transactionLog.delete({
      where: { id }
    });

    return { message: 'Transaction log deleted successfully' };
  }

  async getTransactionLogsByDateRange(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    return await prisma.transactionLog.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async getTransactionLogStats() {
    const [total, statusStats] = await Promise.all([
      prisma.transactionLog.count(),
      prisma.transactionLog.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      })
    ]);

    return {
      total_logs: total,
      status_breakdown: statusStats
    };
  }

  async getRecentTransactionLogs(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await prisma.transactionLog.findMany({
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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
      },
      take: limit
    });
  }

  async searchTransactionLogs(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.transactionLog.findMany({
      where: {
        OR: [
          {
            status: {
              contains: query.trim()
            }
          },
          {
            raw_response: {
              contains: query.trim()
            }
          }
        ]
      },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async getTransactionLogsByStatusAndDateRange(status: string, startDate: Date, endDate: Date) {
    if (!status.trim()) {
      throw new Error('Status is required');
    }

    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    return await prisma.transactionLog.findMany({
      where: {
        status: status.trim(),
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async getTransactionLogsByPaymentAndStatus(paymentId: number, status: string) {
    if (isNaN(paymentId)) {
      throw new Error('Payment ID must be a number');
    }

    if (!status.trim()) {
      throw new Error('Status is required');
    }

    return await prisma.transactionLog.findMany({
      where: {
        payment_id: paymentId,
        status: status.trim()
      },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async bulkDeleteTransactionLogs(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Transaction log IDs array is required');
    }

    const results = [];

    for (const id of ids) {
      try {
        const existingTransactionLog = await prisma.transactionLog.findUnique({
          where: { id }
        });

        if (!existingTransactionLog) {
          results.push({ success: false, id, error: 'Transaction log not found' });
          continue;
        }

        await prisma.transactionLog.delete({
          where: { id }
        });

        results.push({ success: true, id });
      } catch (error) {
        results.push({ 
          success: false, 
          id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async getTransactionLogsByUser(userId: number) {
    if (isNaN(userId)) {
      throw new Error('User ID must be a number');
    }

    return await prisma.transactionLog.findMany({
      where: {
        payment: {
          booking: {
            user_id: userId
          }
        }
      },
      include: {
        payment: {
          include: {
            booking: {
              select: {
                id: true,
                user_id: true
              }
            },
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

  async getUserTransactionLogStats(userId: number) {
    if (isNaN(userId)) {
      throw new Error('User ID must be a number');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const [total, statusStats] = await Promise.all([
      prisma.transactionLog.count({
        where: {
          payment: {
            booking: {
              user_id: userId
            }
          }
        }
      }),
      prisma.transactionLog.groupBy({
        by: ['status'],
        where: {
          payment: {
            booking: {
              user_id: userId
            }
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      })
    ]);

    return {
      user_id: userId,
      total_logs: total,
      status_breakdown: statusStats
    };
  }
}
