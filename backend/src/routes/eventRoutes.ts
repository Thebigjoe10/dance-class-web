import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/', eventController.getEvents);
router.get('/:eventId', eventController.getEvent);

// Checkout route (guest or authenticated)
router.post(
  '/:eventId/checkout',
  optionalAuth,
  paymentLimiter,
  validate(schemas.checkout),
  eventController.checkout
);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(schemas.createEvent),
  eventController.createEvent
);
router.put('/:eventId', authenticate, authorize('ADMIN'), eventController.updateEvent);
router.delete('/:eventId', authenticate, authorize('ADMIN'), eventController.deleteEvent);
router.get('/:eventId/tickets', authenticate, authorize('ADMIN'), eventController.getEventTickets);

export default router;
