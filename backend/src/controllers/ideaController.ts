import { Request, Response } from 'express';
import { GeminiService, ContentIdea } from '../services/geminiService';
import { ContentIdeaModel } from '../models/ContentIdea';
import { CompanyModel } from '../models/Company';
import { BusinessLineModel } from '../models/BusinessLine';
import { AIParamsModel } from '../models/AIParams';
import { generateIdeasSchema, createContentIdeaSchema, updateContentIdeaSchema } from '../schemas/company';

export class IdeaController {
  // Generate content ideas using AI
  static async generateIdeas(req: Request, res: Response) {
    try {
      const { companyId, businessLineId } = req.params;
      const { numberOfIdeas = 5 } = generateIdeasSchema.parse(req.body);

      // Get user ID from authenticated request (skip auth for now)
      const userId = 'demo-user-123'; // Use mock user ID

      // Verify company belongs to user
      const company = await CompanyModel.findById(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Verify business line belongs to company
      const businessLine = await BusinessLineModel.findById(businessLineId);
      if (!businessLine || businessLine.companyId !== companyId) {
        return res.status(404).json({ error: 'Business line not found' });
      }

      // Get AI parameters for the business line
      const aiParams = await AIParamsModel.findByBusinessLineId(businessLineId);
      if (!aiParams) {
        return res.status(400).json({ error: 'AI parameters not found for this business line' });
      }

      // Generate ideas using Gemini AI
      const generatedIdeas = await GeminiService.generateContentIdeas({
        company,
        businessLine,
        aiParams,
        numberOfIdeas
      });

      // Convert generated ideas to database format
      const ideasData = generatedIdeas.map(idea => ({
        businessLineId,
        title: idea.title,
        description: idea.description,
        rationale: idea.rationale,
        platform: idea.platform
      }));

      // Create hashtags map
      const hashtagsMap = new Map<string, string[]>();
      generatedIdeas.forEach(idea => {
        hashtagsMap.set(idea.title, idea.hashtags);
      });

      // Save ideas to database
      const savedIdeas = await ContentIdeaModel.createMultiple(ideasData, hashtagsMap);

      return res.status(201).json({
        message: 'Ideas generated successfully',
        ideas: savedIdeas,
        count: savedIdeas.length
      });
    } catch (error) {
      console.error('Error generating ideas:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all content ideas for a business line
  static async getContentIdeas(req: Request, res: Response) {
    try {
      const { companyId, businessLineId } = req.params;
      const userId = (req as any).user.userId;

      // Verify company belongs to user
      const company = await CompanyModel.findById(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Verify business line belongs to company
      const businessLine = await BusinessLineModel.findById(businessLineId);
      if (!businessLine || businessLine.companyId !== companyId) {
        return res.status(404).json({ error: 'Business line not found' });
      }

      // Get content ideas
      const ideas = await ContentIdeaModel.findByBusinessLineId(businessLineId);

      return res.status(200).json({
        ideas,
        count: ideas.length
      });
    } catch (error) {
      console.error('Error getting content ideas:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get a specific content idea
  static async getContentIdea(req: Request, res: Response) {
    try {
      const { companyId, businessLineId, ideaId } = req.params;
      const userId = (req as any).user.userId;

      // Verify company belongs to user
      const company = await CompanyModel.findById(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Verify business line belongs to company
      const businessLine = await BusinessLineModel.findById(businessLineId);
      if (!businessLine || businessLine.companyId !== companyId) {
        return res.status(404).json({ error: 'Business line not found' });
      }

      // Get content idea
      const idea = await ContentIdeaModel.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ error: 'Content idea not found' });
      }

      // Verify idea belongs to business line
      if (idea.businessLineId !== businessLineId) {
        return res.status(404).json({ error: 'Content idea not found' });
      }

      return res.status(200).json({ idea });
    } catch (error) {
      console.error('Error getting content idea:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new content idea manually
  static async createContentIdea(req: Request, res: Response) {
    try {
      const { companyId, businessLineId } = req.params;
      const ideaData = createContentIdeaSchema.parse(req.body);
      const userId = (req as any).user.userId;

      // Verify company belongs to user
      const company = await CompanyModel.findById(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Verify business line belongs to company
      const businessLine = await BusinessLineModel.findById(businessLineId);
      if (!businessLine || businessLine.companyId !== companyId) {
        return res.status(404).json({ error: 'Business line not found' });
      }

      // Create content idea
      const idea = await ContentIdeaModel.create({
        businessLineId,
        title: ideaData.title,
        description: ideaData.description,
        rationale: ideaData.rationale,
        platform: ideaData.platform
      }, ideaData.hashtags);

      return res.status(201).json({
        message: 'Content idea created successfully',
        idea
      });
    } catch (error) {
      console.error('Error creating content idea:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update a content idea
  static async updateContentIdea(req: Request, res: Response) {
    try {
      const { companyId, businessLineId, ideaId } = req.params;
      const updateData = updateContentIdeaSchema.parse(req.body);
      const userId = (req as any).user.userId;

      // Verify company belongs to user
      const company = await CompanyModel.findById(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Verify business line belongs to company
      const businessLine = await BusinessLineModel.findById(businessLineId);
      if (!businessLine || businessLine.companyId !== companyId) {
        return res.status(404).json({ error: 'Business line not found' });
      }

      // Verify idea exists and belongs to business line
      const existingIdea = await ContentIdeaModel.findById(ideaId);
      if (!existingIdea || existingIdea.businessLineId !== businessLineId) {
        return res.status(404).json({ error: 'Content idea not found' });
      }

      // Update content idea
      const updatedIdea = await ContentIdeaModel.update(ideaId, updateData, updateData.hashtags);

      return res.status(200).json({
        message: 'Content idea updated successfully',
        idea: updatedIdea
      });
    } catch (error) {
      console.error('Error updating content idea:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete a content idea
  static async deleteContentIdea(req: Request, res: Response) {
    try {
      const { companyId, businessLineId, ideaId } = req.params;
      const userId = (req as any).user.userId;

      // Verify company belongs to user
      const company = await CompanyModel.findById(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Verify business line belongs to company
      const businessLine = await BusinessLineModel.findById(businessLineId);
      if (!businessLine || businessLine.companyId !== companyId) {
        return res.status(404).json({ error: 'Business line not found' });
      }

      // Verify idea exists and belongs to business line
      const existingIdea = await ContentIdeaModel.findById(ideaId);
      if (!existingIdea || existingIdea.businessLineId !== businessLineId) {
        return res.status(404).json({ error: 'Content idea not found' });
      }

      // Delete content idea
      await ContentIdeaModel.delete(ideaId);

      return res.status(200).json({
        message: 'Content idea deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content idea:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Test Gemini AI connection
  static async testGeminiConnection(req: Request, res: Response) {
    try {
      const isConnected = await GeminiService.testConnection();
      
      if (isConnected) {
        return res.status(200).json({
          message: 'Gemini AI connection successful',
          status: 'connected'
        });
      } else {
        return res.status(500).json({
          error: 'Gemini AI connection failed',
          status: 'disconnected'
        });
      }
    } catch (error) {
      console.error('Error testing Gemini AI connection:', error);
      return res.status(500).json({
        error: 'Failed to test Gemini AI connection',
        status: 'error'
      });
    }
  }
}
