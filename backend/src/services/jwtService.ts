import jwt from 'jsonwebtoken';
import { AuthUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class JWTService {
  // Generate JWT token
  static generateToken(user: AuthUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return new Date() > expiration;
  }

  // Refresh token (generate new token with same payload but new expiration)
  static refreshToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as JWTPayload;
      return jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
    } catch (error) {
      return null;
    }
  }
}
