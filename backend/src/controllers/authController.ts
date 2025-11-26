import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, phone } = req.body;

    const result = await authService.register({ email, password, name, phone });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: result,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: result.message,
      data: result.user,
    });
  }),

  createAdmin: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, name } = req.body;

    const result = await authService.createAdminUser({ email, password, name });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: result,
    });
  }),

  getMe: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: req.user,
    });
  }),
};
