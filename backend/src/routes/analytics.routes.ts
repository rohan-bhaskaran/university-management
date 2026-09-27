import express from 'express';

import { protect } from '../middlewares/arcjet.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getStats } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/stats', protect, requireAuth(['admin']), getStats);

export default router;