import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateToken = (user: any): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role?.name || 'CUSTOMER',
  };

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
};
