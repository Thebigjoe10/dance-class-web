import { Router } from 'express';
import { classController } from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', classController.getClasses);
router.get('/:classId', classController.getClass);

// Student routes
router.post(
  '/:classId/register',
  authenticate,
  authorize('STUDENT'),
  classController.registerForClass
);
router.delete(
  '/:classId/register',
  authenticate,
  authorize('STUDENT'),
  classController.unregisterFromClass
);
router.get('/student/my-classes', authenticate, authorize('STUDENT'), classController.getStudentClasses);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(schemas.createClass),
  classController.createClass
);
router.put('/:classId', authenticate, authorize('ADMIN'), classController.updateClass);
router.delete('/:classId', authenticate, authorize('ADMIN'), classController.deleteClass);
router.get('/:classId/attendees', authenticate, authorize('ADMIN'), classController.getClassAttendees);
router.post(
  '/:classId/attendance/:studentId',
  authenticate,
  authorize('ADMIN'),
  classController.markAttendance
);
router.get('/:classId/attendance', authenticate, authorize('ADMIN'), classController.getAttendance);

export default router;
