import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Webhook route (no auth - verified via signature)
router.post('/webhook', paymentController.handleWebhook);

// Public verification route
router.get('/verify/:reference', paymentController.verifyPayment);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), paymentController.getPaymentLogs);
router.get('/:paymentId', authenticate, authorize('ADMIN'), paymentController.getPaymentLog);
router.post('/:reference/refund', authenticate, authorize('ADMIN'), paymentController.initiateRefund);

export default router;
