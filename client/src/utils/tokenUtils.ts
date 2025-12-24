// Token validation utilities
export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    // Check if token is expired (exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return true; // Treat invalid tokens as expired
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    // Split token and get payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64 payload
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded) as TokenPayload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const isValidTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  } catch (error) {
    return false;
  }
};
