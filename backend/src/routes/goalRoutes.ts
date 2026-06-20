import { Router } from 'express';
import { body } from 'express-validator';
import { GoalController } from '../controllers/goalController';
import { validateRequest } from '../middleware/validator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', GoalController.listGoals);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Goal title cannot be empty'),
    body('durationMonths').isInt({ min: 1, max: 60 }).withMessage('Duration must be between 1 and 60 months'),
    body('knowledgeLevel').isIn(['none', 'beginner', 'intermediate', 'advanced']).withMessage('Invalid knowledge level'),
    body('dailyTimeCommitment').optional().isInt({ min: 1, max: 24 }).withMessage('Daily time commitment must be between 1 and 24 hours'),
    validateRequest
  ],
  GoalController.createGoal
);

router.get('/:id', GoalController.getGoalDetails);
router.delete('/:id', GoalController.deleteGoal);
router.post('/:id/adapt', GoalController.adaptGoal);

export default router;
