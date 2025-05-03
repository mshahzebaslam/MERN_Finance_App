import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile, 
  deleteProfile, 
  getDashboardData
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { updateBalance } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.patch('/balance', authenticate, updateBalance);
router.get('/dashboard', authenticate, getDashboardData);
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.delete('/me', authenticate, deleteProfile);

export default router;