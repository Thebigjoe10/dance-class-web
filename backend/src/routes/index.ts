import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import classRoutes from './classRoutes';
import eventRoutes from './eventRoutes';
import ticketRoutes from './ticketRoutes';
import paymentRoutes from './paymentRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Dance School API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', userRoutes); // Alias for users
router.use('/classes', classRoutes);
router.use('/events', eventRoutes);
router.use('/tickets', ticketRoutes);
router.use('/payments', paymentRoutes);
router.use('/paystack', paymentRoutes); // Alias for Paystack webhook
router.use('/notifications', notificationRoutes);

export default router;
