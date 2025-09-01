import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessLine {
  id: string;
  name: string;
  description: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessLineData {
  name: string;
  description: string;
  companyId: string;
}

export interface UpdateBusinessLineData {
  name?: string;
  description?: string;
}

export class BusinessLineModel {
  // Get all business lines for a company
  static async findByCompanyId(companyId: string): Promise<BusinessLine[]> {
    const [rows] = await pool.execute(
      'SELECT id, name, description, company_id as companyId, created_at as createdAt, updated_at as updatedAt FROM business_lines WHERE company_id = ? ORDER BY created_at DESC',
      [companyId]
    );
    return rows as BusinessLine[];
  }

  // Get business line by ID
  static async findById(id: string): Promise<BusinessLine | null> {
    const [rows] = await pool.execute(
      'SELECT id, name, description, company_id as companyId, created_at as createdAt, updated_at as updatedAt FROM business_lines WHERE id = ?',
      [id]
    );
    const businessLines = rows as BusinessLine[];
    return businessLines.length > 0 ? businessLines[0] : null;
  }

  // Create new business line
  static async create(businessLineData: CreateBusinessLineData): Promise<BusinessLine> {
    const id = uuidv4();
    
    const [result] = await pool.execute(
      'INSERT INTO business_lines (id, name, description, company_id) VALUES (?, ?, ?, ?)',
      [id, businessLineData.name, businessLineData.description, businessLineData.companyId]
    );

    return this.findById(id) as Promise<BusinessLine>;
  }

  // Update business line
  static async update(id: string, businessLineData: UpdateBusinessLineData): Promise<BusinessLine | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (businessLineData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(businessLineData.name);
    }
    if (businessLineData.description !== undefined) {
      updateFields.push('description = ?');
      values.push(businessLineData.description);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE business_lines SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete business line
  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM business_lines WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Check if business line exists
  static async exists(id: string): Promise<boolean> {
    const [rows] = await pool.execute('SELECT 1 FROM business_lines WHERE id = ?', [id]);
    return (rows as any[]).length > 0;
  }

  // Check if business line belongs to company
  static async belongsToCompany(id: string, companyId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT 1 FROM business_lines WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    return (rows as any[]).length > 0;
  }

  // Get business line with company info
  static async findByIdWithCompany(id: string): Promise<(BusinessLine & { companyName: string }) | null> {
    const [rows] = await pool.execute(
      `SELECT bl.id, bl.name, bl.description, bl.company_id as companyId, 
              bl.created_at as createdAt, bl.updated_at as updatedAt,
              c.name as companyName
       FROM business_lines bl
       JOIN companies c ON bl.company_id = c.id
       WHERE bl.id = ?`,
      [id]
    );
    const businessLines = rows as (BusinessLine & { companyName: string })[];
    return businessLines.length > 0 ? businessLines[0] : null;
  }
}
