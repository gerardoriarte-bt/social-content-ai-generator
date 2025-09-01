import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';
import { UserModel } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

// Middleware to authenticate JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const payload = JWTService.verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if user still exists in database
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Add user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is authenticated (optional)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = JWTService.verifyToken(token);
      if (payload) {
        const user = await UserModel.findById(payload.userId);
        if (user) {
                  req.user = {
          userId: payload.userId,
          email: payload.email,
        };
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Middleware to check if user is admin (example for future use)
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // For now, we'll allow all authenticated users
  // In the future, you can add role-based access control
  next();
};
