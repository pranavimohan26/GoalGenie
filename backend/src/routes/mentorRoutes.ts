import { Router } from 'express';
import { body } from 'express-validator';
import { MentorController } from '../controllers/mentorController';
import { validateRequest } from '../middleware/validator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post(
  '/chat',
  [
    body('goalId').isUUID().withMessage('Provide a valid Goal ID'),
    body('message').trim().notEmpty().withMessage('Chat message cannot be empty'),
    validateRequest
  ],
  MentorController.sendMessage
);

export default router;
