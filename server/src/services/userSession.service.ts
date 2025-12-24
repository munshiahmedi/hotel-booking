import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserSessionService {
  async getUserSessions(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.userSession.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.userSession.count({
        where: { user_id: userId }
      })
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getSessionById(id: number) {
    const session = await prisma.userSession.findUnique({
      where: { id },
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

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  async createSession(sessionData: {
    user_id: number;
    ip_address: string;
    user_agent: string;
    expires_at: Date;
  }) {
    const session = await prisma.userSession.create({
      data: sessionData,
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

    return session;
  }

  async updateSession(id: number, updateData: {
    expires_at?: Date;
  }) {
    // First check if session exists
    const existingSession = await prisma.userSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      throw new Error('Session not found');
    }

    const session = await prisma.userSession.update({
      where: { id },
      data: updateData,
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

    return session;
  }

  async deleteSession(id: number) {
    // Check if session exists first
    const existingSession = await prisma.userSession.findUnique({
      where: { id }
    });

    if (!existingSession) {
      throw new Error('Session not found');
    }

    await prisma.userSession.delete({
      where: { id }
    });

    return { message: 'Session deleted successfully' };
  }

  async deleteExpiredSessions() {
    const result = await prisma.userSession.deleteMany({
      where: {
        expires_at: {
          lt: new Date()
        }
      }
    });

    return { 
      message: `${result.count} expired sessions deleted`,
      deletedCount: result.count
    };
  }

  async deleteAllUserSessions(userId: number) {
    const result = await prisma.userSession.deleteMany({
      where: { user_id: userId }
    });

    return { 
      message: `All sessions for user ${userId} deleted`,
      deletedCount: result.count
    };
  }
}
