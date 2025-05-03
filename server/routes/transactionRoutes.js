import express from 'express';
import { 
  createTransaction, 
  getTransactions, 
  getTransaction, 
  updateTransaction, 
  deleteTransaction,
  getExpenseBreakdown 
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import Transaction from '../models/transaction.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createTransaction);
// router.get('/', getTransactions);
// router.get('/:id', authorize(Transaction), getTransaction);
router.get('/',  (req, res) => {
  const { startDate, endDate } = req.query;
  getTransactions(req, res, startDate, endDate);
});
router.get('/breakdown', getExpenseBreakdown);

router.patch('/:id', authorize(Transaction), updateTransaction);
router.delete('/:id', authorize(Transaction), deleteTransaction);

export default router;