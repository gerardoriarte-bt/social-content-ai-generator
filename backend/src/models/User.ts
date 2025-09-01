import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  password?: string; // Only for internal use, never returned to client
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  // Get all users (without passwords)
  static async findAll(): Promise<AuthUser[]> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar_url as avatarUrl, created_at as createdAt, updated_at as updatedAt FROM users ORDER BY created_at DESC'
    );
    return rows as AuthUser[];
  }

  // Get user by ID (without password)
  static async findById(id: string): Promise<AuthUser | null> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar_url as avatarUrl, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
      [id]
    );
    const users = rows as AuthUser[];
    return users.length > 0 ? users[0] : null;
  }

  // Get user by email (with password for authentication)
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar_url as avatarUrl, password, created_at as createdAt, updated_at as updatedAt FROM users WHERE email = ?',
      [email]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // Create new user with hashed password
  static async create(userData: CreateUserData): Promise<AuthUser> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [result] = await pool.execute(
      'INSERT INTO users (id, name, email, avatar_url, password) VALUES (?, ?, ?, ?, ?)',
      [id, userData.name, userData.email, userData.avatarUrl, hashedPassword]
    );

    return this.findById(id) as Promise<AuthUser>;
  }

  // Update user
  static async update(id: string, userData: UpdateUserData): Promise<AuthUser | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (userData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.avatarUrl !== undefined) {
      updateFields.push('avatar_url = ?');
      values.push(userData.avatarUrl);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Update password
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    return (result as any).affectedRows > 0;
  }

  // Delete user
  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Check if user exists
  static async exists(id: string): Promise<boolean> {
    const [rows] = await pool.execute('SELECT 1 FROM users WHERE id = ?', [id]);
    return (rows as any[]).length > 0;
  }

  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const [rows] = await pool.execute('SELECT 1 FROM users WHERE email = ?', [email]);
    return (rows as any[]).length > 0;
  }

  // Verify password
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  // Authenticate user
  static async authenticate(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValidPassword = await this.verifyPassword(user, password);
    if (!isValidPassword) return null;

    // Return user without password
    const { password: _, ...authUser } = user;
    return authUser as AuthUser;
  }
}
