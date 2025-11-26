import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// User routes
router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/:notificationId/read', authenticate, notificationController.markAsRead);
router.put('/mark-all-read', authenticate, notificationController.markAllAsRead);
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

// Admin routes
router.post(
  '/broadcast',
  authenticate,
  authorize('ADMIN'),
  validate(schemas.sendNotification),
  notificationController.sendBroadcast
);
router.post(
  '/class-reminders',
  authenticate,
  authorize('ADMIN'),
  notificationController.sendClassReminders
);

export default router;
