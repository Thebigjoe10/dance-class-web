import { Router } from 'express';
import { ticketController } from '../controllers/ticketController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { verifyLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public/guest routes
router.get('/:ticketId', ticketController.getTicket);

// Verification route (for staff)
router.post(
  '/verify',
  authenticate,
  authorize('ADMIN'),
  verifyLimiter,
  validate(schemas.verifyTicket),
  ticketController.verifyTicket
);

// Authenticated user routes
router.get('/user/my-tickets', authenticate, ticketController.getMyTickets);
router.post('/user/link', authenticate, ticketController.linkTicketsToUser);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), ticketController.getTicketsByEmail);
router.put('/:ticketId/use', authenticate, authorize('ADMIN'), ticketController.markTicketAsUsed);
router.put('/:ticketId/cancel', authenticate, authorize('ADMIN'), ticketController.cancelTicket);

export default router;
