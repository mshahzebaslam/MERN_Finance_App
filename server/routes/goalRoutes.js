import express from 'express';
import { 
  createGoal, 
  getGoals, 
  getGoal, 
  updateGoal, 
  deleteGoal,
  addToGoal,
  getGoalProgress, 
  getGoalsMetrics
} from '../controllers/goalController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import Goal from '../models/goal.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes that don't need resource authorization
router.post('/', createGoal);
router.get('/', getGoals);
router.get('/metrics', getGoalsMetrics);  // Moved before :id routes

// Routes that need resource authorization
router.get('/:id', authorize(Goal), getGoal);
router.patch('/:id', authorize(Goal), updateGoal);
router.delete('/:id', authorize(Goal), deleteGoal);
router.post('/:id/add', authorize(Goal), addToGoal);
router.get('/:id/progress', authorize(Goal), getGoalProgress);

export default router;