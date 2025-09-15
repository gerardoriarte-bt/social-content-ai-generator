import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Skip authentication for now
// router.use(authenticateToken);

// Company routes
router.get('/', CompanyController.getCompanies);
router.post('/', CompanyController.createCompany);
router.get('/:id', CompanyController.getCompany);
router.put('/:id', CompanyController.updateCompany);
router.delete('/:id', CompanyController.deleteCompany);

// Business line routes
router.get('/:companyId/business-lines', CompanyController.getBusinessLines);
router.post('/:companyId/business-lines', CompanyController.createBusinessLine);
router.put('/:companyId/business-lines/:businessLineId', CompanyController.updateBusinessLine);
router.delete('/:companyId/business-lines/:businessLineId', CompanyController.deleteBusinessLine);

// AI parameters routes
router.get('/:companyId/business-lines/:businessLineId/ai-params', CompanyController.getAIParams);
router.post('/:companyId/business-lines/:businessLineId/ai-params', CompanyController.createAIParams);
router.put('/:companyId/business-lines/:businessLineId/ai-params/:aiParamsId', CompanyController.updateAIParams);

export default router;
