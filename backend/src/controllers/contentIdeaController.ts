import { Request, Response } from 'express';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { createContentIdeaSchema, updateContentIdeaSchema } from '../schemas/company';
import { ContentIdeaModel } from '../models/ContentIdea';
import { CompanyModel } from '../models/Company';
import { BusinessLineModel } from '../models/BusinessLine';

export class ContentIdeaController {
  // Get all content ideas for a business line
  static getContentIdeas = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const { companyId, businessLineId } = req.params;

      // Check if company belongs to user
      if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      // Check if business line belongs to company
      if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
        return res.status(403).json({
          error: 'Business line does not belong to this company',
        });
      }

      const ideas = await ContentIdeaModel.findByBusinessLineIdWithCompany(businessLineId);

      return res.json({
        ideas,
        count: ideas.length,
      });
    } catch (error) {
      console.error('Get content ideas error:', error);
      return res.status(500).json({
        error: 'Failed to get content ideas',
      });
    }
  };

  // Get a specific content idea
  static getContentIdea = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const { companyId, businessLineId, ideaId } = req.params;

      // Check if company belongs to user
      if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      // Check if business line belongs to company
      if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
        return res.status(403).json({
          error: 'Business line does not belong to this company',
        });
      }

      // Check if content idea belongs to business line
      if (!(await ContentIdeaModel.belongsToBusinessLine(ideaId, businessLineId))) {
        return res.status(403).json({
          error: 'Content idea does not belong to this business line',
        });
      }

      const idea = await ContentIdeaModel.findById(ideaId);
      if (!idea) {
        return res.status(404).json({
          error: 'Content idea not found',
        });
      }

      return res.json({
        idea,
      });
    } catch (error) {
      console.error('Get content idea error:', error);
      return res.status(500).json({
        error: 'Failed to get content idea',
      });
    }
  };

  // Create a new content idea
  static createContentIdea = [
    validate(createContentIdeaSchema),
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required',
          });
        }

        const { companyId, businessLineId } = req.params;
        const { title, description, rationale, platform, hashtags } = req.body;

        // Check if company belongs to user
        if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
          return res.status(403).json({
            error: 'Access denied',
          });
        }

        // Check if business line belongs to company
        if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
          return res.status(403).json({
            error: 'Business line does not belong to this company',
          });
        }

        const idea = await ContentIdeaModel.create(
          {
            businessLineId,
            title,
            description,
            rationale,
            platform,
          },
          hashtags || []
        );

        return res.status(201).json({
          message: 'Content idea created successfully',
          idea,
        });
      } catch (error) {
        console.error('Create content idea error:', error);
        return res.status(500).json({
          error: 'Failed to create content idea',
        });
      }
    },
  ];

  // Update a content idea
  static updateContentIdea = [
    validate(updateContentIdeaSchema),
    async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required',
          });
        }

        const { companyId, businessLineId, ideaId } = req.params;
        const { title, description, rationale, platform, hashtags } = req.body;

        // Check if company belongs to user
        if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
          return res.status(403).json({
            error: 'Access denied',
          });
        }

        // Check if business line belongs to company
        if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
          return res.status(403).json({
            error: 'Business line does not belong to this company',
          });
        }

        // Check if content idea belongs to business line
        if (!(await ContentIdeaModel.belongsToBusinessLine(ideaId, businessLineId))) {
          return res.status(403).json({
            error: 'Content idea does not belong to this business line',
          });
        }

        const updatedIdea = await ContentIdeaModel.update(
          ideaId,
          {
            title,
            description,
            rationale,
            platform,
          },
          hashtags
        );

        if (!updatedIdea) {
          return res.status(404).json({
            error: 'Content idea not found',
          });
        }

        return res.json({
          message: 'Content idea updated successfully',
          idea: updatedIdea,
        });
      } catch (error) {
        console.error('Update content idea error:', error);
        return res.status(500).json({
          error: 'Failed to update content idea',
        });
      }
    },
  ];

  // Delete a content idea
  static deleteContentIdea = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const { companyId, businessLineId, ideaId } = req.params;

      // Check if company belongs to user
      if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      // Check if business line belongs to company
      if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
        return res.status(403).json({
          error: 'Business line does not belong to this company',
        });
      }

      // Check if content idea belongs to business line
      if (!(await ContentIdeaModel.belongsToBusinessLine(ideaId, businessLineId))) {
        return res.status(403).json({
          error: 'Content idea does not belong to this business line',
        });
      }

      const deleted = await ContentIdeaModel.delete(ideaId);
      if (!deleted) {
        return res.status(404).json({
          error: 'Content idea not found',
        });
      }

      return res.json({
        message: 'Content idea deleted successfully',
      });
    } catch (error) {
      console.error('Delete content idea error:', error);
      return res.status(500).json({
        error: 'Failed to delete content idea',
      });
    }
  };
}
