import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Student routes (protected)
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, validate(schemas.updateProfile), userController.updateProfile);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), userController.getAllStudents);
router.get('/:studentId', authenticate, authorize('ADMIN'), userController.getStudent);
router.put(
  '/:studentId/level',
  authenticate,
  authorize('ADMIN'),
  userController.updateStudentLevel
);
router.delete('/:studentId', authenticate, authorize('ADMIN'), userController.deleteStudent);

export default router;
