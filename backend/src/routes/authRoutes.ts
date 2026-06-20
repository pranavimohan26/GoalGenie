import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('hoursPerDay').optional().isInt({ min: 1, max: 24 }).withMessage('Hours per day must be between 1 and 24'),
    body('learningStyle').optional().isIn(['visual', 'reading', 'practical']).withMessage('Invalid learning style choice'),
    validateRequest
  ],
  AuthController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  AuthController.login
);

router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;
