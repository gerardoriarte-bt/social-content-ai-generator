import { Request, Response } from 'express';
import { CompanyModel } from '../models/Company';
import { BusinessLineModel } from '../models/BusinessLine';
import { AIParamsModel } from '../models/AIParams';
import { createCompanySchema, updateCompanySchema, createBusinessLineSchema, updateBusinessLineSchema, createAIParamsSchema, updateAIParamsSchema } from '../schemas/company';
import { validate } from '../middleware/validation';

export class CompanyController {
  // Get all companies for current user
  static getCompanies = async (req: Request, res: Response) => {
    try {
      // Skip authentication for now
      // if (!req.user) {
      //   return res.status(401).json({
      //     error: 'Authentication required',
      //   });
      // }

      // Use a mock user ID for now
      const mockUserId = 'mock-user-123';
      const companies = await CompanyModel.findByUserIdWithBusinessLines(mockUserId);

      return res.json({
        companies,
      });
    } catch (error) {
      console.error('Get companies error:', error);
      return res.status(500).json({
        error: 'Failed to get companies',
      });
    }
  };

  // Get company by ID
  static getCompany = async (req: Request, res: Response) => {
    try {
      // Skip authentication for now
      // if (!req.user) {
      //   return res.status(401).json({
      //     error: 'Authentication required',
      //   });
      // }

      const { id } = req.params;

      const company = await CompanyModel.findByIdWithBusinessLines(id);
      if (!company) {
        return res.status(404).json({
          error: 'Company not found',
        });
      }

      // Skip user ownership check for now
      // if (!(await CompanyModel.belongsToUser(id, req.user.userId))) {
      //   return res.status(403).json({
      //     error: 'Access denied',
      //   });
      // }

      return res.json({
        company,
      });
    } catch (error) {
      console.error('Get company error:', error);
      return res.status(500).json({
        error: 'Failed to get company',
      });
    }
  };

  // Create new company
  static createCompany = [
    validate(createCompanySchema),
    async (req: Request, res: Response) => {
      try {
        // Skip authentication for now
        // if (!req.user) {
        //   return res.status(401).json({
        //     error: 'Authentication required',
        //   });
        // }

        const { name, description, industry } = req.body;

        const company = await CompanyModel.create({
          name,
          description,
          industry,
          userId: 'mock-user-123', // Use mock user ID
        });

        return res.status(201).json({
          message: 'Company created successfully',
          company,
        });
      } catch (error) {
        console.error('Create company error:', error);
        return res.status(500).json({
          error: 'Failed to create company',
        });
      }
    },
  ];

  // Update company
  static updateCompany = [
    validate(updateCompanySchema),
    async (req: Request, res: Response) => {
      try {
        // Skip authentication for now
        // if (!req.user) {
        //   return res.status(401).json({
        //     error: 'Authentication required',
        //   });
        // }

        const { id } = req.params;
        const { name, description, industry } = req.body;

        // Skip user ownership check for now
        // if (!(await CompanyModel.belongsToUser(id, req.user.userId))) {
        //   return res.status(403).json({
        //     error: 'Access denied',
        //   });
        // }

        const updatedCompany = await CompanyModel.update(id, {
          name,
          description,
          industry,
        });

        if (!updatedCompany) {
          return res.status(404).json({
            error: 'Company not found',
          });
        }

        return res.json({
          message: 'Company updated successfully',
          company: updatedCompany,
        });
      } catch (error) {
        console.error('Update company error:', error);
        return res.status(500).json({
          error: 'Failed to update company',
        });
      }
    },
  ];

  // Delete company
  static deleteCompany = async (req: Request, res: Response) => {
    try {
      // Skip authentication for now
      // if (!req.user) {
      //   return res.status(401).json({
      //     error: 'Authentication required',
      //   });
      // }

      const { id } = req.params;

      // Skip user ownership check for now
      // if (!(await CompanyModel.belongsToUser(id, req.user.userId))) {
      //   return res.status(403).json({
      //     error: 'Access denied',
      //   });
      // }

      const success = await CompanyModel.delete(id);
      if (!success) {
        return res.status(404).json({
          error: 'Company not found',
        });
      }

      return res.json({
        message: 'Company deleted successfully',
      });
    } catch (error) {
      console.error('Delete company error:', error);
      return res.status(500).json({
        error: 'Failed to delete company',
      });
    }
  };

  // Get business lines for a company
  static getBusinessLines = async (req: Request, res: Response) => {
    try {
      // Skip authentication for now
      // if (!req.user) {
      //   return res.status(401).json({
      //     error: 'Authentication required',
      //   });
      // }

      const { companyId } = req.params;

      // Skip user ownership check for now
      // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
      //   return res.status(403).json({
      //     error: 'Access denied',
      //   });
      // }

      const businessLines = await BusinessLineModel.findByCompanyId(companyId);

      return res.json({
        businessLines,
      });
    } catch (error) {
      console.error('Get business lines error:', error);
      return res.status(500).json({
        error: 'Failed to get business lines',
      });
    }
  };

  // Create business line
  static createBusinessLine = [
    validate(createBusinessLineSchema),
    async (req: Request, res: Response) => {
      try {
        // Skip authentication for now
        // if (!req.user) {
        //   return res.status(401).json({
        //     error: 'Authentication required',
        //   });
        // }

        const { companyId } = req.params;
        const { name, description } = req.body;

        // Skip user ownership check for now
        // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        //   return res.status(403).json({
        //     error: 'Access denied',
        //   });
        // }

        const businessLine = await BusinessLineModel.create({
          name,
          description,
          companyId,
        });

        // Create default AI parameters for the new business line
        const defaultAIParams = await AIParamsModel.create({
          businessLineId: businessLine.id,
          tone: 'Profesional y amigable',
          characterType: 'Experto en la industria',
          targetAudience: 'Clientes potenciales y existentes',
          contentType: 'Posts informativos y promocionales',
          socialNetwork: 'Instagram',
          contentFormat: 'Post',
          objective: 'Awareness',
          focus: '',
        });

        return res.status(201).json({
          message: 'Business line created successfully',
          businessLine,
          aiParams: defaultAIParams,
        });
      } catch (error) {
        console.error('Create business line error:', error);
        return res.status(500).json({
          error: 'Failed to create business line',
        });
      }
    },
  ];

  // Update business line
  static updateBusinessLine = [
    validate(updateBusinessLineSchema),
    async (req: Request, res: Response) => {
      try {
        // Skip authentication for now
        // if (!req.user) {
        //   return res.status(401).json({
        //     error: 'Authentication required',
        //   });
        // }

        const { companyId, businessLineId } = req.params;
        const { name, description } = req.body;

        // Skip user ownership check for now
        // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        //   return res.status(403).json({
        //     error: 'Access denied',
        //   });
        // }

        // Check if business line belongs to company
        if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
          return res.status(403).json({
            error: 'Business line does not belong to this company',
          });
        }

        const updatedBusinessLine = await BusinessLineModel.update(businessLineId, {
          name,
          description,
        });

        if (!updatedBusinessLine) {
          return res.status(404).json({
            error: 'Business line not found',
          });
        }

        return res.json({
          message: 'Business line updated successfully',
          businessLine: updatedBusinessLine,
        });
      } catch (error) {
        console.error('Update business line error:', error);
        return res.status(500).json({
          error: 'Failed to update business line',
        });
      }
    },
  ];

  // Delete business line
  static deleteBusinessLine = async (req: Request, res: Response) => {
    try {
      // Skip authentication for now
      // if (!req.user) {
      //   return res.status(401).json({
      //     error: 'Authentication required',
      //   });
      // }

      const { companyId, businessLineId } = req.params;

      // Skip user ownership check for now
      // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
      //   return res.status(403).json({
      //     error: 'Access denied',
      //   });
      // }

      // Check if business line belongs to company
      if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
        return res.status(403).json({
          error: 'Business line does not belong to this company',
        });
      }

      const success = await BusinessLineModel.delete(businessLineId);
      if (!success) {
        return res.status(404).json({
          error: 'Business line not found',
        });
      }

      return res.json({
        message: 'Business line deleted successfully',
      });
    } catch (error) {
      console.error('Delete business line error:', error);
      return res.status(500).json({
        error: 'Failed to delete business line',
      });
    }
  };

  // Get AI params for a business line
  static getAIParams = async (req: Request, res: Response) => {
    try {
      // Skip authentication for now
      // if (!req.user) {
      //   return res.status(401).json({
      //     error: 'Authentication required',
      //   });
      // }

      const { companyId, businessLineId } = req.params;

      // Skip user ownership check for now
      // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
      //   return res.status(403).json({
      //     error: 'Access denied',
      //   });
      // }

      // Check if business line belongs to company
      if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
        return res.status(403).json({
          error: 'Business line does not belong to this company',
        });
      }

      const aiParams = await AIParamsModel.findByBusinessLineId(businessLineId);

      return res.json({
        aiParams,
      });
    } catch (error) {
      console.error('Get AI params error:', error);
      return res.status(500).json({
        error: 'Failed to get AI parameters',
      });
    }
  };

  // Create AI params
  static createAIParams = [
    validate(createAIParamsSchema),
    async (req: Request, res: Response) => {
      try {
        // Skip authentication for now
        // if (!req.user) {
        //   return res.status(401).json({
        //     error: 'Authentication required',
        //   });
        // }

        const { companyId, businessLineId } = req.params;
        const { tone, characterType, targetAudience, contentType, socialNetwork, contentFormat, objective, focus } = req.body;

        // Skip user ownership check for now
        // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        //   return res.status(403).json({
        //     error: 'Access denied',
        //   });
        // }

        // Check if business line belongs to company
        if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
          return res.status(403).json({
            error: 'Business line does not belong to this company',
          });
        }

        // Check if AI params already exist for this business line
        const existingParams = await AIParamsModel.findByBusinessLineId(businessLineId);
        if (existingParams) {
          return res.status(400).json({
            error: 'AI parameters already exist for this business line',
          });
        }

        const aiParams = await AIParamsModel.create({
          businessLineId,
          tone,
          characterType,
          targetAudience,
          contentType,
          socialNetwork,
          contentFormat,
          objective,
          focus,
        });

        return res.status(201).json({
          message: 'AI parameters created successfully',
          aiParams,
        });
      } catch (error) {
        console.error('Create AI params error:', error);
        return res.status(500).json({
          error: 'Failed to create AI parameters',
        });
      }
    },
  ];

  // Update AI params
  static updateAIParams = [
    validate(updateAIParamsSchema),
    async (req: Request, res: Response) => {
      try {
        // Skip authentication for now
        // if (!req.user) {
        //   return res.status(401).json({
        //     error: 'Authentication required',
        //   });
        // }

        const { companyId, businessLineId, aiParamsId } = req.params;
        const { tone, characterType, targetAudience, contentType, socialNetwork, contentFormat, objective, focus } = req.body;

        // Skip user ownership check for now
        // if (!(await CompanyModel.belongsToUser(companyId, req.user.userId))) {
        //   return res.status(403).json({
        //     error: 'Access denied',
        //   });
        // }

        // Check if business line belongs to company
        if (!(await BusinessLineModel.belongsToCompany(businessLineId, companyId))) {
          return res.status(403).json({
            error: 'Business line does not belong to this company',
          });
        }

        // Check if AI params belongs to business line
        if (!(await AIParamsModel.belongsToBusinessLine(aiParamsId, businessLineId))) {
          return res.status(403).json({
            error: 'AI parameters do not belong to this business line',
          });
        }

        const updatedAIParams = await AIParamsModel.update(aiParamsId, {
          tone,
          characterType,
          targetAudience,
          contentType,
          socialNetwork,
          contentFormat,
          objective,
          focus,
        });

        if (!updatedAIParams) {
          return res.status(404).json({
            error: 'AI parameters not found',
          });
        }

        return res.json({
          message: 'AI parameters updated successfully',
          aiParams: updatedAIParams,
        });
      } catch (error) {
        console.error('Update AI params error:', error);
        return res.status(500).json({
          error: 'Failed to update AI parameters',
        });
      }
    },
  ];
}
