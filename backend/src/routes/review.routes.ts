import { Router } from 'express';
import { analyzeCode, getHistory, getHistoryDetail, deleteHistory } from '../controllers/review.controller';
import { reviewRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/analyze', reviewRateLimiter, analyzeCode);
router.get('/history', getHistory);
router.get('/history/:sessionId', getHistoryDetail);
router.delete('/history/:sessionId', deleteHistory);

export default router;
