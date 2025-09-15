import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { BusinessLineModel } from './BusinessLine';

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  name: string;
  description: string;
  industry: string;
  userId: string;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  industry?: string;
}

export interface CompanyWithBusinessLines extends Company {
  businessLines: any[];
}

export class CompanyModel {
  // Get all companies for a user
  static async findByUserId(userId: string): Promise<Company[]> {
    const [rows] = await pool.execute(
      'SELECT id, name, description, industry, user_id as userId, created_at as createdAt, updated_at as updatedAt FROM companies WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Company[];
  }

  // Get company by ID
  static async findById(id: string): Promise<Company | null> {
    const [rows] = await pool.execute(
      'SELECT id, name, description, industry, user_id as userId, created_at as createdAt, updated_at as updatedAt FROM companies WHERE id = ?',
      [id]
    );
    const companies = rows as Company[];
    return companies.length > 0 ? companies[0] : null;
  }

  // Create new company
  static async create(companyData: CreateCompanyData): Promise<Company> {
    const id = uuidv4();
    
    const [result] = await pool.execute(
      'INSERT INTO companies (id, name, description, industry, user_id) VALUES (?, ?, ?, ?, ?)',
      [id, companyData.name, companyData.description, companyData.industry, companyData.userId]
    );

    return this.findById(id) as Promise<Company>;
  }

  // Update company
  static async update(id: string, companyData: UpdateCompanyData): Promise<Company | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (companyData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(companyData.name);
    }
    if (companyData.description !== undefined) {
      updateFields.push('description = ?');
      values.push(companyData.description);
    }
    if (companyData.industry !== undefined) {
      updateFields.push('industry = ?');
      values.push(companyData.industry);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE companies SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete company
  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM companies WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Check if company exists
  static async exists(id: string): Promise<boolean> {
    const [rows] = await pool.execute('SELECT 1 FROM companies WHERE id = ?', [id]);
    return (rows as any[]).length > 0;
  }

  // Check if company belongs to user
  static async belongsToUser(id: string, userId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT 1 FROM companies WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return (rows as any[]).length > 0;
  }

  // Get company with business lines
  static async findByIdWithBusinessLines(id: string): Promise<CompanyWithBusinessLines | null> {
    const company = await this.findById(id);
    if (!company) return null;

    const businessLines = await BusinessLineModel.findByCompanyId(id);
    
    return {
      ...company,
      businessLines,
    };
  }

  // Get all companies with business lines for a user
  static async findByUserIdWithBusinessLines(userId: string): Promise<CompanyWithBusinessLines[]> {
    const companies = await this.findByUserId(userId);
    const companiesWithBusinessLines: CompanyWithBusinessLines[] = [];

    for (const company of companies) {
      const businessLines = await BusinessLineModel.findByCompanyId(company.id);
      companiesWithBusinessLines.push({
        ...company,
        businessLines,
      });
    }

    return companiesWithBusinessLines;
  }
}
