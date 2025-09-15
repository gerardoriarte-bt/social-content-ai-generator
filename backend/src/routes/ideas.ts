import { Router } from 'express';
import { IdeaController } from '../controllers/ideaController';
// import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { generateIdeasSchema, createContentIdeaSchema, updateContentIdeaSchema } from '../schemas/company';

const router = Router();

// Skip authentication for now
// router.use(authenticateToken);

// Test Gemini AI connection
router.get('/test-gemini', IdeaController.testGeminiConnection);

// Generate content ideas using AI
router.post('/companies/:companyId/business-lines/:businessLineId/generate', 
  validate(generateIdeasSchema), 
  IdeaController.generateIdeas
);

// Get all content ideas for a business line
router.get('/companies/:companyId/business-lines/:businessLineId/ideas', 
  IdeaController.getContentIdeas
);

// Get a specific content idea
router.get('/companies/:companyId/business-lines/:businessLineId/ideas/:ideaId', 
  IdeaController.getContentIdea
);

// Create a new content idea manually
router.post('/companies/:companyId/business-lines/:businessLineId/ideas', 
  validate(createContentIdeaSchema), 
  IdeaController.createContentIdea
);

// Update a content idea
router.put('/companies/:companyId/business-lines/:businessLineId/ideas/:ideaId', 
  validate(updateContentIdeaSchema), 
  IdeaController.updateContentIdea
);

// Delete a content idea
router.delete('/companies/:companyId/business-lines/:businessLineId/ideas/:ideaId', 
  IdeaController.deleteContentIdea
);

export default router;
