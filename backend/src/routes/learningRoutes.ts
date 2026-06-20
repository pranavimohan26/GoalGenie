import { Router } from 'express';
import { getLearningSession, submitQuiz } from '../controllers/learningController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// /api/v1/milestones/:milestoneId/learn
router.get('/:milestoneId/learn', authenticateToken, getLearningSession);

// /api/v1/milestones/:milestoneId/learn/quiz
router.post('/:milestoneId/learn/quiz', authenticateToken, submitQuiz);

export default router;
