import { Router } from 'express';
import { body } from 'express-validator';
import { TaskController } from '../controllers/taskController';
import { validateRequest } from '../middleware/validator';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.patch(
  '/:id',
  [
    body('isCompleted').isBoolean().withMessage('isCompleted must be a boolean value'),
    validateRequest
  ],
  TaskController.updateTask
);

export default router;
