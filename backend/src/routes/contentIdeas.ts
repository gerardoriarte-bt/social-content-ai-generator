import { Router } from 'express';
import { ContentIdeaController } from '../controllers/contentIdeaController';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Skip authentication for now
// router.use(authenticateToken);

// Content idea routes
router.get('/:companyId/business-lines/:businessLineId/content-ideas', ContentIdeaController.getContentIdeas);
router.get('/:companyId/business-lines/:businessLineId/content-ideas/:ideaId', ContentIdeaController.getContentIdea);
router.post('/:companyId/business-lines/:businessLineId/content-ideas', ContentIdeaController.createContentIdea);
router.put('/:companyId/business-lines/:businessLineId/content-ideas/:ideaId', ContentIdeaController.updateContentIdea);
router.delete('/:companyId/business-lines/:businessLineId/content-ideas/:ideaId', ContentIdeaController.deleteContentIdea);

export default router;
