import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.get('/verify/:token', authController.verifyEmail);

// Protected routes
router.get('/me', authenticate, authController.getMe);

// Admin only
router.post(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  validate(schemas.register),
  authController.createAdmin
);

export default router;
