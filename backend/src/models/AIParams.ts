import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface AIParams {
  id: string;
  businessLineId: string;
  tone: string;
  characterType: string;
  targetAudience: string;
  contentType: string;
  socialNetwork: string;
  contentFormat: string;
  objective: string;
  focus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAIParamsData {
  businessLineId: string;
  tone: string;
  characterType: string;
  targetAudience: string;
  contentType: string;
  socialNetwork: string;
  contentFormat: string;
  objective: string;
  focus: string;
}

export interface UpdateAIParamsData {
  tone?: string;
  characterType?: string;
  targetAudience?: string;
  contentType?: string;
  socialNetwork?: string;
  contentFormat?: string;
  objective?: string;
  focus?: string;
}

export class AIParamsModel {
  // Get AI params by business line ID
  static async findByBusinessLineId(businessLineId: string): Promise<AIParams | null> {
    const [rows] = await pool.execute(
      'SELECT id, business_line_id as businessLineId, tone, character_type as characterType, target_audience as targetAudience, content_type as contentType, social_network as socialNetwork, content_format as contentFormat, objective, focus, created_at as createdAt, updated_at as updatedAt FROM ai_params WHERE business_line_id = ?',
      [businessLineId]
    );
    const aiParams = rows as AIParams[];
    return aiParams.length > 0 ? aiParams[0] : null;
  }

  // Get AI params by ID
  static async findById(id: string): Promise<AIParams | null> {
    const [rows] = await pool.execute(
      'SELECT id, business_line_id as businessLineId, tone, character_type as characterType, target_audience as targetAudience, content_type as contentType, social_network as socialNetwork, content_format as contentFormat, objective, focus, created_at as createdAt, updated_at as updatedAt FROM ai_params WHERE id = ?',
      [id]
    );
    const aiParams = rows as AIParams[];
    return aiParams.length > 0 ? aiParams[0] : null;
  }

  // Create new AI params
  static async create(aiParamsData: CreateAIParamsData): Promise<AIParams> {
    const id = uuidv4();
    
    const [result] = await pool.execute(
      'INSERT INTO ai_params (id, business_line_id, tone, character_type, target_audience, content_type, social_network, content_format, objective, focus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, aiParamsData.businessLineId, aiParamsData.tone, aiParamsData.characterType, aiParamsData.targetAudience, aiParamsData.contentType, aiParamsData.socialNetwork, aiParamsData.contentFormat, aiParamsData.objective, aiParamsData.focus]
    );

    return this.findById(id) as Promise<AIParams>;
  }

  // Update AI params
  static async update(id: string, aiParamsData: UpdateAIParamsData): Promise<AIParams | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (aiParamsData.tone !== undefined) {
      updateFields.push('tone = ?');
      values.push(aiParamsData.tone);
    }
    if (aiParamsData.characterType !== undefined) {
      updateFields.push('character_type = ?');
      values.push(aiParamsData.characterType);
    }
    if (aiParamsData.targetAudience !== undefined) {
      updateFields.push('target_audience = ?');
      values.push(aiParamsData.targetAudience);
    }
    if (aiParamsData.contentType !== undefined) {
      updateFields.push('content_type = ?');
      values.push(aiParamsData.contentType);
    }
    if (aiParamsData.socialNetwork !== undefined) {
      updateFields.push('social_network = ?');
      values.push(aiParamsData.socialNetwork);
    }
    if (aiParamsData.contentFormat !== undefined) {
      updateFields.push('content_format = ?');
      values.push(aiParamsData.contentFormat);
    }
    if (aiParamsData.objective !== undefined) {
      updateFields.push('objective = ?');
      values.push(aiParamsData.objective);
    }
    if (aiParamsData.focus !== undefined) {
      updateFields.push('focus = ?');
      values.push(aiParamsData.focus);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE ai_params SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Delete AI params
  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM ai_params WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Check if AI params exists
  static async exists(id: string): Promise<boolean> {
    const [rows] = await pool.execute('SELECT 1 FROM ai_params WHERE id = ?', [id]);
    return (rows as any[]).length > 0;
  }

  // Check if AI params belongs to business line
  static async belongsToBusinessLine(id: string, businessLineId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT 1 FROM ai_params WHERE id = ? AND business_line_id = ?',
      [id, businessLineId]
    );
    return (rows as any[]).length > 0;
  }

  // Get AI params with business line info
  static async findByIdWithBusinessLine(id: string): Promise<(AIParams & { businessLineName: string; companyName: string }) | null> {
    const [rows] = await pool.execute(
      `SELECT ap.id, ap.business_line_id as businessLineId, ap.tone, ap.character_type as characterType, 
              ap.target_audience as targetAudience, ap.content_type as contentType, 
              ap.created_at as createdAt, ap.updated_at as updatedAt,
              bl.name as businessLineName, c.name as companyName
       FROM ai_params ap
       JOIN business_lines bl ON ap.business_line_id = bl.id
       JOIN companies c ON bl.company_id = c.id
       WHERE ap.id = ?`,
      [id]
    );
    const aiParams = rows as (AIParams & { businessLineName: string; companyName: string })[];
    return aiParams.length > 0 ? aiParams[0] : null;
  }
}
