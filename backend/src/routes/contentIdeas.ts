import { Router } from 'express';
import { ContentIdeaController } from '../controllers/contentIdeaController';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Skip authentication for now
// router.use(authenticateToken);

// Content idea routes
router.get('/companies/:companyId/business-lines/:businessLineId/content-ideas', ContentIdeaController.getContentIdeas);
router.get('/companies/:companyId/business-lines/:businessLineId/content-ideas/:ideaId', ContentIdeaController.getContentIdea);
router.post('/companies/:companyId/business-lines/:businessLineId/content-ideas', ContentIdeaController.createContentIdea);
router.put('/companies/:companyId/business-lines/:businessLineId/content-ideas/:ideaId', ContentIdeaController.updateContentIdea);
router.delete('/companies/:companyId/business-lines/:businessLineId/content-ideas/:ideaId', ContentIdeaController.deleteContentIdea);

export default router;
