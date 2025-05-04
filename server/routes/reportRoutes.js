import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
import { exportReport } from '../controllers/reportController.js';

router.get('/export', authenticate, exportReport);

export default router;