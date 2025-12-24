import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditLogService {
  async getAllAuditLogs() {
    return await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogById(id: number) {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!auditLog) {
      throw new Error('Audit log not found');
    }

    return auditLog;
  }

  async getAuditLogsByUser(userId: number) {
    return await prisma.auditLog.findMany({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogsByAction(action: string) {
    if (!action.trim()) {
      throw new Error('Action is required');
    }

    return await prisma.auditLog.findMany({
      where: { action: action.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogsByEntity(entity: string) {
    if (!entity.trim()) {
      throw new Error('Entity is required');
    }

    return await prisma.auditLog.findMany({
      where: { entity: entity.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogsByEntityId(entityId: number) {
    if (isNaN(entityId)) {
      throw new Error('Entity ID must be a number');
    }

    return await prisma.auditLog.findMany({
      where: { entity_id: entityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async createAuditLog(data: {
    user_id: number;
    action: string;
    entity: string;
    entity_id: number;
    payload?: string;
  }) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.user_id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!data.action.trim()) {
      throw new Error('Action is required');
    }

    if (!data.entity.trim()) {
      throw new Error('Entity is required');
    }

    if (isNaN(data.entity_id)) {
      throw new Error('Entity ID must be a number');
    }

    return await prisma.auditLog.create({
      data: {
        user_id: data.user_id,
        action: data.action.trim(),
        entity: data.entity.trim(),
        entity_id: data.entity_id,
        payload: data.payload?.trim() || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async deleteAuditLog(id: number) {
    // Check if audit log exists
    const existingAuditLog = await prisma.auditLog.findUnique({
      where: { id }
    });

    if (!existingAuditLog) {
      throw new Error('Audit log not found');
    }

    await prisma.auditLog.delete({
      where: { id }
    });

    return { message: 'Audit log deleted successfully' };
  }

  async getAuditLogsByDateRange(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    return await prisma.auditLog.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogsByUserAndAction(userId: number, action: string) {
    if (isNaN(userId)) {
      throw new Error('User ID must be a number');
    }

    if (!action.trim()) {
      throw new Error('Action is required');
    }

    return await prisma.auditLog.findMany({
      where: {
        user_id: userId,
        action: action.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogsByEntityAndAction(entity: string, action: string) {
    if (!entity.trim()) {
      throw new Error('Entity is required');
    }

    if (!action.trim()) {
      throw new Error('Action is required');
    }

    return await prisma.auditLog.findMany({
      where: {
        entity: entity.trim(),
        action: action.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogStats() {
    const [total, userStats, actionStats, entityStats] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['user_id'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    return {
      total_logs: total,
      top_users: userStats,
      top_actions: actionStats,
      top_entities: entityStats
    };
  }

  async getUserAuditLogStats(userId: number) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const [total, actionStats, entityStats] = await Promise.all([
      prisma.auditLog.count({ where: { user_id: userId } }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { user_id: userId },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        where: { user_id: userId },
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
      action_breakdown: actionStats,
      entity_breakdown: entityStats
    };
  }

  async getRecentAuditLogs(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });
  }

  async searchAuditLogs(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.auditLog.findMany({
      where: {
        OR: [
          {
            action: {
              contains: query.trim()
            }
          },
          {
            entity: {
              contains: query.trim()
            }
          },
          {
            payload: {
              contains: query.trim()
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getAuditLogsByDateRangeAndUser(userId: number, startDate: Date, endDate: Date) {
    if (isNaN(userId)) {
      throw new Error('User ID must be a number');
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

    return await prisma.auditLog.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async bulkDeleteAuditLogs(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Audit log IDs array is required');
    }

    const results = [];

    for (const id of ids) {
      try {
        const existingAuditLog = await prisma.auditLog.findUnique({
          where: { id }
        });

        if (!existingAuditLog) {
          results.push({ success: false, id, error: 'Audit log not found' });
          continue;
        }

        await prisma.auditLog.delete({
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

  async getAuditLogsByActionAndDateRange(action: string, startDate: Date, endDate: Date) {
    if (!action.trim()) {
      throw new Error('Action is required');
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

    return await prisma.auditLog.findMany({
      where: {
        action: action.trim(),
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
