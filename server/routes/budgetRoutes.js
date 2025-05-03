import express from 'express';
import { 
  createBudget, 
  getBudgets, 
  getBudget, 
  updateBudget, 
  deleteBudget,
  getBudgetSummary 
} from '../controllers/budgetController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import Budget from '../models/budget.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createBudget);
router.get('/', getBudgets);
router.get('/summary', getBudgetSummary);
router.get('/:id', authorize(Budget), getBudget);
router.patch('/:id', authorize(Budget), updateBudget);
router.delete('/:id', authorize(Budget), deleteBudget);

export default router;