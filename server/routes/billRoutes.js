import express from 'express';
import Bill from '../models/bill.js';

import { 
  createBill, 
  getBills, 
  getBill, 
  updateBill, 
  deleteBill,
  markBillAsPaid 
} from '../controllers/billController.js';
import { authenticate, authorize } from '../middleware/auth.js';


const router = express.Router();

router.use(authenticate);

router.post('/', createBill);
router.get('/', getBills);
router.get('/:id', authorize(Bill), getBill);
router.patch('/:id', authorize(Bill), updateBill);
router.delete('/:id', authorize(Bill), deleteBill);
router.post('/:id/paid', authorize(Bill), markBillAsPaid);

export default router;