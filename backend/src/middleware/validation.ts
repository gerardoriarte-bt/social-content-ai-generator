import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Generic validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      } else {
        res.status(500).json({
          error: 'Validation error',
        });
      }
    }
  };
};

// Validation middleware for query parameters
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          error: 'Query validation failed',
          details: errors,
        });
      } else {
        res.status(500).json({
          error: 'Query validation error',
        });
      }
    }
  };
};

// Validation middleware for URL parameters
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          error: 'Parameter validation failed',
          details: errors,
        });
      } else {
        res.status(500).json({
          error: 'Parameter validation error',
        });
      }
    }
  };
};
