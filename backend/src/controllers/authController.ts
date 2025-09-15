import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { JWTService } from '../services/jwtService';
import { loginSchema, registerSchema, updateUserSchema, changePasswordSchema } from '../schemas/auth';
import { validate } from '../middleware/validation';

export class AuthController {
  // Register new user
  static register = [
    validate(registerSchema),
    async (req: Request, res: Response) => {
      try {
        const { name, email, password, avatarUrl } = req.body;

        // Check if email already exists
        const existingUser = await UserModel.emailExists(email);
        if (existingUser) {
          return res.status(400).json({
            error: 'Email already registered',
          });
        }

        // Create new user
        const user = await UserModel.create({
          name,
          email,
          password,
          avatarUrl,
        });

        // Generate JWT token
        const token = JWTService.generateToken(user);

        return res.status(201).json({
          message: 'User registered successfully',
          user,
          token,
        });
      } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
          error: 'Registration failed',
        });
      }
    },
  ];

  // Login user
  static login = [
    validate(loginSchema),
    async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;

        // Authenticate user
        const user = await UserModel.authenticate(email, password);
        if (!user) {
          return res.status(401).json({
            error: 'Invalid email or password',
          });
        }

        // Generate JWT token
        const token = JWTService.generateToken(user);

        return res.json({
          message: 'Login successful',
          user,
          token,
        });
      } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
          error: 'Login failed',
        });
      }
    },
  ];

  // Get current user profile
  static getProfile = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        error: 'Failed to get profile',
      });
    }
  };

  // Update user profile
  static updateProfile = [
    validate(updateUserSchema),
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required',
          });
        }

        const { name, email, avatarUrl } = req.body;

        // Check if email is being changed and if it already exists
        if (email && email !== req.user.email) {
          const existingUser = await UserModel.emailExists(email);
          if (existingUser) {
            return res.status(400).json({
              error: 'Email already registered',
            });
          }
        }

        // Update user
        const updatedUser = await UserModel.update(req.user.userId, {
          name,
          email,
          avatarUrl,
        });

        if (!updatedUser) {
          return res.status(404).json({
            error: 'User not found',
          });
        }

        return res.json({
          message: 'Profile updated successfully',
          user: updatedUser,
        });
      } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
          error: 'Failed to update profile',
        });
      }
    },
  ];

  // Change password
  static changePassword = [
    validate(changePasswordSchema),
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required',
          });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password for verification
        const user = await UserModel.findByEmail(req.user.email);
        if (!user) {
          return res.status(404).json({
            error: 'User not found',
          });
        }

        // Verify current password
        const isValidPassword = await UserModel.verifyPassword(user, currentPassword);
        if (!isValidPassword) {
          return res.status(401).json({
            error: 'Current password is incorrect',
          });
        }

        // Update password
        const success = await UserModel.updatePassword(req.user.userId, newPassword);
        if (!success) {
          return res.status(500).json({
            error: 'Failed to update password',
          });
        }

        return res.json({
          message: 'Password changed successfully',
        });
      } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
          error: 'Failed to change password',
        });
      }
    },
  ];

  // Refresh token
  static refreshToken = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTService.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          error: 'Token required',
        });
      }

      const newToken = JWTService.refreshToken(token);
      if (!newToken) {
        return res.status(401).json({
          error: 'Invalid token',
        });
      }

      return res.json({
        message: 'Token refreshed successfully',
        token: newToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(500).json({
        error: 'Failed to refresh token',
      });
    }
  };

  // Logout (client-side token removal, but we can add token blacklisting here)
  static logout = async (req: Request, res: Response) => {
    try {
      // In a more advanced implementation, you could blacklist the token
      // For now, we'll just return a success message
      return res.json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        error: 'Logout failed',
      });
    }
  };
}
