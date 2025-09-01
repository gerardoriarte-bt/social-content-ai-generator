import { z } from 'zod';

// Company schemas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  industry: z.string().min(2, 'Industry must be at least 2 characters').max(50, 'Industry too long'),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long').optional(),
  industry: z.string().min(2, 'Industry must be at least 2 characters').max(50, 'Industry too long').optional(),
});

// Business Line schemas
export const createBusinessLineSchema = z.object({
  name: z.string().min(2, 'Business line name must be at least 2 characters').max(100, 'Business line name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
});

export const updateBusinessLineSchema = z.object({
  name: z.string().min(2, 'Business line name must be at least 2 characters').max(100, 'Business line name too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long').optional(),
});

// AI Parameters schemas
export const createAIParamsSchema = z.object({
  tone: z.string().min(2, 'Tone must be at least 2 characters').max(50, 'Tone too long'),
  characterType: z.string().min(2, 'Character type must be at least 2 characters').max(50, 'Character type too long'),
  targetAudience: z.string().min(2, 'Target audience must be at least 2 characters').max(100, 'Target audience too long'),
  contentType: z.string().min(2, 'Content type must be at least 2 characters').max(50, 'Content type too long'),
  socialNetwork: z.string().min(2, 'Social network must be at least 2 characters').max(50, 'Social network too long'),
  contentFormat: z.string().min(2, 'Content format must be at least 2 characters').max(50, 'Content format too long'),
  objective: z.string().min(2, 'Objective must be at least 2 characters').max(50, 'Objective too long'),
  focus: z.string().max(200, 'Focus too long'),
});

export const updateAIParamsSchema = z.object({
  tone: z.string().min(2, 'Tone must be at least 2 characters').max(50, 'Tone too long').optional(),
  characterType: z.string().min(2, 'Character type must be at least 2 characters').max(50, 'Character type too long').optional(),
  targetAudience: z.string().min(2, 'Target audience must be at least 2 characters').max(100, 'Target audience too long').optional(),
  contentType: z.string().min(2, 'Content type must be at least 2 characters').max(50, 'Content type too long').optional(),
  socialNetwork: z.string().min(2, 'Social network must be at least 2 characters').max(50, 'Social network too long').optional(),
  contentFormat: z.string().min(2, 'Content format must be at least 2 characters').max(50, 'Content format too long').optional(),
  objective: z.string().min(2, 'Objective must be at least 2 characters').max(50, 'Objective too long').optional(),
  focus: z.string().max(200, 'Focus too long').optional(),
});

// Idea Group schemas
export const createIdeaGroupSchema = z.object({
  name: z.string().min(2, 'Idea group name must be at least 2 characters').max(100, 'Idea group name too long'),
  companyId: z.string().uuid('Invalid company ID'),
  businessLineId: z.string().uuid('Invalid business line ID'),
  aiParamsId: z.string().uuid('Invalid AI parameters ID'),
});

export const updateIdeaGroupSchema = z.object({
  name: z.string().min(2, 'Idea group name must be at least 2 characters').max(100, 'Idea group name too long').optional(),
});

// Content Idea schemas
export const createContentIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  rationale: z.string().min(10, 'Rationale must be at least 10 characters').max(1000, 'Rationale too long'),
  platform: z.string().min(2, 'Platform must be at least 2 characters').max(50, 'Platform too long'),
  hashtags: z.array(z.string().min(1, 'Hashtag cannot be empty')).max(10, 'Maximum 10 hashtags allowed'),
});

export const updateContentIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long').optional(),
  rationale: z.string().min(10, 'Rationale must be at least 10 characters').max(1000, 'Rationale too long').optional(),
  platform: z.string().min(2, 'Platform must be at least 2 characters').max(50, 'Platform too long').optional(),
  hashtags: z.array(z.string().min(1, 'Hashtag cannot be empty')).max(10, 'Maximum 10 hashtags allowed').optional(),
});

// Idea Generation schemas
export const generateIdeasSchema = z.object({
  numberOfIdeas: z.number().min(1, 'Must generate at least 1 idea').max(10, 'Cannot generate more than 10 ideas').default(5),
});

// Types derived from schemas
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateBusinessLineInput = z.infer<typeof createBusinessLineSchema>;
export type UpdateBusinessLineInput = z.infer<typeof updateBusinessLineSchema>;
export type CreateAIParamsInput = z.infer<typeof createAIParamsSchema>;
export type UpdateAIParamsInput = z.infer<typeof updateAIParamsSchema>;
export type CreateIdeaGroupInput = z.infer<typeof createIdeaGroupSchema>;
export type UpdateIdeaGroupInput = z.infer<typeof updateIdeaGroupSchema>;
export type CreateContentIdeaInput = z.infer<typeof createContentIdeaSchema>;
export type UpdateContentIdeaInput = z.infer<typeof updateContentIdeaSchema>;
export type GenerateIdeasInput = z.infer<typeof generateIdeasSchema>;
