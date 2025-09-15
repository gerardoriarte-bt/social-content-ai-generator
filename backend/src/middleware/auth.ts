import { Request, Response, NextFunction } from 'express';

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

// Middleware to authenticate JWT token - DISABLED FOR DEMO
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Always set demo user for demo purposes
  req.user = {
    userId: 'demo-user-123',
    email: 'demo@example.com',
  };
  next();
};

// Middleware to check if user is authenticated (optional)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Always set demo user for demo purposes
  req.user = {
    userId: 'demo-user-123',
    email: 'demo@example.com',
  };
  next();
};

// Middleware to check if user is admin (example for future use)
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Always allow for demo purposes
  next();
};
