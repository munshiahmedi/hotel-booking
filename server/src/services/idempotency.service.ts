import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export interface IdempotencyKey {
  key: string;
  endpoint: string;
  request_hash: string;
  response_data: any;
  status: 'pending' | 'completed' | 'failed';
  expires_at: Date;
  created_at: Date;
}

export class IdempotencyService {
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private static cache = new Map<string, any>(); // Simple in-memory cache

  static generateKey(): string {
    return `idemp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async createKey(key: string, endpoint: string, requestHash: string): Promise<any> {
    const expiresAt = new Date(Date.now() + this.DEFAULT_TTL);
    
    // Use in-memory cache for simplicity
    this.cache.set(key, {
      key,
      endpoint,
      request_hash: requestHash,
      status: 'pending',
      expires_at: expiresAt
    });
    
    return { key, status: 'pending' };
  }

  static async getKey(key: string): Promise<any | null> {
    // Clean up expired keys
    for (const [k, v] of this.cache.entries()) {
      if (new Date(v.expires_at) < new Date()) {
        this.cache.delete(k);
      }
    }

    return this.cache.get(key) || null;
  }

  static async updateKey(key: string, responseData: any, status: 'completed' | 'failed'): Promise<any> {
    const existing = this.cache.get(key);
    if (existing) {
      const updated = {
        ...existing,
        response_data: responseData,
        status,
        updated_at: new Date()
      };
      this.cache.set(key, updated);
      return updated;
    }
    
    return null;
  }

  static hashRequest(req: Request): string {
    const crypto = require('crypto');
    const relevantData = {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization?.substring(0, 20) // Partial auth header
      }
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(relevantData))
      .digest('hex');
  }
}

export function idempotencyMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      return next();
    }

    try {
      // Check if key exists
      const existingKey = await IdempotencyService.getKey(idempotencyKey);
      
      if (existingKey) {
        // Check if this is the same request
        const requestHash = IdempotencyService.hashRequest(req);
        
        if (existingKey.request_hash === requestHash) {
          // Same request - return cached response
          if (existingKey.status === 'completed') {
            return res.status(200).json(existingKey.response_data);
          } else if (existingKey.status === 'pending') {
            return res.status(202).json({ 
              message: 'Request is being processed',
              idempotency_key: idempotencyKey 
            });
          } else {
            return res.status(400).json({ 
              error: 'Previous request failed',
              idempotency_key: idempotencyKey 
            });
          }
        } else {
          // Different request with same key - error
          return res.status(400).json({ 
            error: 'Idempotency key already used with different request',
            idempotency_key: idempotencyKey 
          });
        }
      } else {
        // New request - create idempotency key record
        const requestHash = IdempotencyService.hashRequest(req);
        await IdempotencyService.createKey(idempotencyKey, req.url, requestHash);
        
        // Store the key on the request for later use
        (req as any).idempotencyKey = idempotencyKey;
        (req as any).requestHash = requestHash;
        
        return next();
      }
    } catch (error) {
      console.error('Idempotency middleware error:', error);
      return next(); // Continue without idempotency if there's an error
    }
  };
}

export async function handleIdempotentResponse(
  req: Request, 
  res: Response, 
  responseData: any, 
  status: 'completed' | 'failed' = 'completed'
) {
  const idempotencyKey = (req as any).idempotencyKey;
  
  if (idempotencyKey) {
    try {
      await IdempotencyService.updateKey(idempotencyKey, responseData, status);
    } catch (error) {
      console.error('Failed to update idempotency key:', error);
    }
  }
  
  return responseData;
}
