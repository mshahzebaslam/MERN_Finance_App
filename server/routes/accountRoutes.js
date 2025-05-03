import express from 'express';
import { 
  createAccount, 
  getAccounts, 
  getAccount, 
  updateAccount, 
  deleteAccount 
} from '../controllers/accountController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import Account from '../models/account.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createAccount);
router.get('/', getAccounts);
router.get('/:id', authorize(Account), getAccount);
router.patch('/:id', authorize(Account), updateAccount);
router.delete('/:id', authorize(Account), deleteAccount);

export default router;