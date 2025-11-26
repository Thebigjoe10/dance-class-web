import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  updateProfile: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    guardianName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    medicalInfo: z.string().optional(),
  }),

  createClass: z.object({
    name: z.string().min(1, 'Class name is required'),
    style: z.string().min(1, 'Style is required'),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
    instructor: z.string().min(1, 'Instructor name is required'),
    description: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    duration: z.number().positive(),
    capacity: z.number().positive().default(20),
    price: z.number().nonnegative().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
  }),

  createEvent: z.object({
    title: z.string().min(1, 'Event title is required'),
    description: z.string().optional(),
    date: z.string(),
    time: z.string(),
    venue: z.string().min(1, 'Venue is required'),
    capacity: z.number().positive(),
    price: z.number().nonnegative(),
    imageUrl: z.string().url().optional(),
  }),

  checkout: z.object({
    buyerName: z.string().min(2, 'Buyer name is required'),
    buyerEmail: z.string().email('Invalid email address'),
    buyerPhone: z.string().min(10, 'Valid phone number is required'),
  }),

  verifyTicket: z.object({
    qrPayload: z.string().min(1, 'QR payload is required'),
  }),

  sendNotification: z.object({
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required'),
    type: z.enum([
      'CLASS_REMINDER',
      'TICKET_CONFIRMATION',
      'PAYMENT_SUCCESS',
      'GENERAL',
      'ADMIN_BROADCAST',
    ]),
    userIds: z.array(z.string()).optional(),
    sendToAll: z.boolean().optional(),
  }),
};
