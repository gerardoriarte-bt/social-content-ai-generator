import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface ContentIdea {
  id: string;
  businessLineId: string;
  title: string;
  description: string;
  rationale: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentIdeaData {
  businessLineId: string;
  title: string;
  description: string;
  rationale: string;
  platform: string;
}

export interface UpdateContentIdeaData {
  title?: string;
  description?: string;
  rationale?: string;
  platform?: string;
}

export interface ContentIdeaWithHashtags extends ContentIdea {
  hashtags: string[];
}

export class ContentIdeaModel {
  // Get content ideas by business line ID
  static async findByBusinessLineId(businessLineId: string): Promise<ContentIdeaWithHashtags[]> {
    const [rows] = await pool.execute(
      `SELECT 
        ci.id, 
        ci.business_line_id as businessLineId, 
        ci.title, 
        ci.description, 
        ci.rationale, 
        ci.platform,
        ci.created_at as createdAt, 
        ci.updated_at as updatedAt,
        GROUP_CONCAT(h.tag) as hashtags
      FROM content_ideas ci
      LEFT JOIN hashtags h ON ci.id = h.content_idea_id
      WHERE ci.business_line_id = ?
      GROUP BY ci.id
      ORDER BY ci.created_at DESC`,
      [businessLineId]
    );

    return (rows as any[]).map(row => ({
      ...row,
      hashtags: row.hashtags ? row.hashtags.split(',') : []
    })) as ContentIdeaWithHashtags[];
  }

  // Get content idea by ID
  static async findById(id: string): Promise<ContentIdeaWithHashtags | null> {
    const [rows] = await pool.execute(
      `SELECT 
        ci.id, 
        ci.business_line_id as businessLineId, 
        ci.title, 
        ci.description, 
        ci.rationale, 
        ci.platform,
        ci.created_at as createdAt, 
        ci.updated_at as updatedAt,
        GROUP_CONCAT(h.tag) as hashtags
      FROM content_ideas ci
      LEFT JOIN hashtags h ON ci.id = h.content_idea_id
      WHERE ci.id = ?
      GROUP BY ci.id`,
      [id]
    );

    const ideas = rows as any[];
    if (ideas.length === 0) return null;

    const idea = ideas[0];
    return {
      ...idea,
      hashtags: idea.hashtags ? idea.hashtags.split(',') : []
    } as ContentIdeaWithHashtags;
  }

  // Create new content idea
  static async create(ideaData: CreateContentIdeaData, hashtags: string[] = []): Promise<ContentIdeaWithHashtags> {
    const id = uuidv4();
    
    // Insert content idea
    await pool.execute(
      'INSERT INTO content_ideas (id, business_line_id, title, description, rationale, platform) VALUES (?, ?, ?, ?, ?, ?)',
      [id, ideaData.businessLineId, ideaData.title, ideaData.description, ideaData.rationale, ideaData.platform]
    );

    // Insert hashtags
    if (hashtags.length > 0) {
      for (const tag of hashtags) {
        const hashtagId = uuidv4();
        await pool.execute(
          'INSERT INTO hashtags (id, content_idea_id, tag) VALUES (?, ?, ?)',
          [hashtagId, id, tag]
        );
      }
    }

    return this.findById(id) as Promise<ContentIdeaWithHashtags>;
  }

  // Create multiple content ideas
  static async createMultiple(ideasData: CreateContentIdeaData[], hashtagsMap: Map<string, string[]> = new Map()): Promise<ContentIdeaWithHashtags[]> {
    const createdIdeas: ContentIdeaWithHashtags[] = [];

    for (const ideaData of ideasData) {
      const hashtags = hashtagsMap.get(ideaData.title) || [];
      const createdIdea = await this.create(ideaData, hashtags);
      createdIdeas.push(createdIdea);
    }

    return createdIdeas;
  }

  // Update content idea
  static async update(id: string, ideaData: UpdateContentIdeaData, hashtags?: string[]): Promise<ContentIdeaWithHashtags | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (ideaData.title !== undefined) {
      updateFields.push('title = ?');
      values.push(ideaData.title);
    }
    if (ideaData.description !== undefined) {
      updateFields.push('description = ?');
      values.push(ideaData.description);
    }
    if (ideaData.rationale !== undefined) {
      updateFields.push('rationale = ?');
      values.push(ideaData.rationale);
    }
    if (ideaData.platform !== undefined) {
      updateFields.push('platform = ?');
      values.push(ideaData.platform);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE content_ideas SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }

    // Update hashtags if provided
    if (hashtags !== undefined) {
      // Delete existing hashtags
      await pool.execute('DELETE FROM hashtags WHERE content_idea_id = ?', [id]);
      
      // Insert new hashtags
      if (hashtags.length > 0) {
        for (const tag of hashtags) {
          const hashtagId = uuidv4();
          await pool.execute(
            'INSERT INTO hashtags (id, content_idea_id, tag) VALUES (?, ?, ?)',
            [hashtagId, id, tag]
          );
        }
      }
    }

    return this.findById(id);
  }

  // Delete content idea
  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM content_ideas WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Check if content idea exists
  static async exists(id: string): Promise<boolean> {
    const [rows] = await pool.execute('SELECT 1 FROM content_ideas WHERE id = ?', [id]);
    return (rows as any[]).length > 0;
  }

  // Check if content idea belongs to business line
  static async belongsToBusinessLine(id: string, businessLineId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      'SELECT 1 FROM content_ideas WHERE id = ? AND business_line_id = ?',
      [id, businessLineId]
    );
    return (rows as any[]).length > 0;
  }

  // Get content ideas by business line ID with company info
  static async findByBusinessLineIdWithCompany(businessLineId: string): Promise<any[]> {
    const [rows] = await pool.execute(
      `SELECT 
        ci.id, 
        ci.business_line_id as businessLineId, 
        ci.title, 
        ci.description, 
        ci.rationale, 
        ci.platform,
        ci.created_at as createdAt, 
        ci.updated_at as updatedAt,
        GROUP_CONCAT(h.tag) as hashtags,
        bl.name as businessLineName,
        c.name as companyName,
        c.industry as companyIndustry
      FROM content_ideas ci
      LEFT JOIN hashtags h ON ci.id = h.content_idea_id
      LEFT JOIN business_lines bl ON ci.business_line_id = bl.id
      LEFT JOIN companies c ON bl.company_id = c.id
      WHERE ci.business_line_id = ?
      GROUP BY ci.id
      ORDER BY ci.created_at DESC`,
      [businessLineId]
    );

    return (rows as any[]).map(row => ({
      ...row,
      hashtags: row.hashtags ? row.hashtags.split(',') : []
    }));
  }
}
