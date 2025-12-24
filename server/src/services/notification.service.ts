import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  async getAllNotifications() {
    return await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getNotificationById(id: number) {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async getNotificationsByUser(userId: number) {
    return await prisma.notification.findMany({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getNotificationsByStatus(status: string) {
    if (!status.trim()) {
      throw new Error('Status is required');
    }

    return await prisma.notification.findMany({
      where: { status: status.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async getNotificationsByType(type: string) {
    if (!type.trim()) {
      throw new Error('Type is required');
    }

    return await prisma.notification.findMany({
      where: { type: type.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async createNotification(data: {
    user_id: number;
    title: string;
    message: string;
    type: string;
    status?: string;
  }) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.user_id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!data.title.trim()) {
      throw new Error('Title is required');
    }

    if (!data.message.trim()) {
      throw new Error('Message is required');
    }

    if (!data.type.trim()) {
      throw new Error('Type is required');
    }

    const validStatuses = ['sent', 'failed'];
    const status = data.status || 'sent';
    
    if (!validStatuses.includes(status)) {
      throw new Error('Status must be either "sent" or "failed"');
    }

    return await prisma.notification.create({
      data: {
        user_id: data.user_id,
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type.trim(),
        status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });
  }

  async updateNotification(id: number, data: {
    title?: string;
    message?: string;
    type?: string;
    status?: string;
  }) {
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      throw new Error('Notification not found');
    }

    const updateData: any = {};
    
    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new Error('Title cannot be empty');
      }
      updateData.title = data.title.trim();
    }

    if (data.message !== undefined) {
      if (!data.message.trim()) {
        throw new Error('Message cannot be empty');
      }
      updateData.message = data.message.trim();
    }

    if (data.type !== undefined) {
      if (!data.type.trim()) {
        throw new Error('Type cannot be empty');
      }
      updateData.type = data.type.trim();
    }

    if (data.status !== undefined) {
      const validStatuses = ['sent', 'failed'];
      if (!validStatuses.includes(data.status)) {
        throw new Error('Status must be either "sent" or "failed"');
      }
      updateData.status = data.status;
    }

    return await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });
  }

  async deleteNotification(id: number) {
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      throw new Error('Notification not found');
    }

    await prisma.notification.delete({
      where: { id }
    });

    return { message: 'Notification deleted successfully' };
  }

  async markNotificationAsSent(id: number) {
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      throw new Error('Notification not found');
    }

    return await prisma.notification.update({
      where: { id },
      data: { status: 'sent' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });
  }

  async markNotificationAsFailed(id: number) {
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      throw new Error('Notification not found');
    }

    return await prisma.notification.update({
      where: { id },
      data: { status: 'failed' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });
  }

  async bulkCreateNotifications(notifications: Array<{
    user_id: number;
    title: string;
    message: string;
    type: string;
    status?: string;
  }>) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw new Error('Notifications array is required');
    }

    const results = [];

    for (const notificationData of notifications) {
      try {
        const notification = await this.createNotification(notificationData);
        results.push({ success: true, data: notification });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          data: notificationData
        });
      }
    }

    return results;
  }

  async getNotificationStats() {
    const [total, sent, failed] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'sent' } }),
      prisma.notification.count({ where: { status: 'failed' } })
    ]);

    return {
      total_notifications: total,
      sent_notifications: sent,
      failed_notifications: failed,
      success_rate: total > 0 ? Math.round((sent / total) * 100) : 0
    };
  }

  async getUserNotificationStats(userId: number) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const [total, sent, failed] = await Promise.all([
      prisma.notification.count({ where: { user_id: userId } }),
      prisma.notification.count({ where: { user_id: userId, status: 'sent' } }),
      prisma.notification.count({ where: { user_id: userId, status: 'failed' } })
    ]);

    return {
      user_id: userId,
      total_notifications: total,
      sent_notifications: sent,
      failed_notifications: failed,
      success_rate: total > 0 ? Math.round((sent / total) * 100) : 0
    };
  }

  async getRecentNotifications(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });
  }

  async searchNotifications(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.notification.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query.trim()
            }
          },
          {
            message: {
              contains: query.trim()
            }
          },
          {
            type: {
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
        },
        notification_logs: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
