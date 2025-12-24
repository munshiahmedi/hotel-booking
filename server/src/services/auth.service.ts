import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils';
import { UserSessionService } from './userSession.service';

const prisma = new PrismaClient();
const userSessionService = new UserSessionService();

export class AuthService {
  async login(email: string, password: string, req?: any) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user || !user.is_active) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user);
    
    // Create session record
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      await userSessionService.createSession({
        user_id: user.id,
        ip_address: req?.ip || '127.0.0.1',
        user_agent: req?.get('User-Agent') || 'Unknown',
        expires_at: expiresAt
      });
    } catch (sessionError) {
      // Log session error but don't fail login
      console.error('Failed to create session:', sessionError);
    }
    
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'CUSTOMER'
      }
    };
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const customerRole = await prisma.role.findUnique({
      where: { name: 'CUSTOMER' }
    });

    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        phone: userData.phone || null,
        role_id: customerRole.id,
      },
      include: { role: true }
    });

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'CUSTOMER'
      }
    };
  }
}
