import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { userService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export const userController = {
  getProfile: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const profile = await userService.getProfile(userId);

    res.json({
      success: true,
      data: profile,
    });
  }),

  updateProfile: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const profile = await userService.updateProfile(userId, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  }),

  getAllStudents: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { level, verified } = req.query;

    const filters: any = {};
    if (level) filters.level = level;
    if (verified !== undefined) filters.verified = verified === 'true';

    const students = await userService.getAllStudents(filters);

    res.json({
      success: true,
      data: students,
      count: students.length,
    });
  }),

  getStudent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;

    const student = await userService.getStudent(studentId);

    res.json({
      success: true,
      data: student,
    });
  }),

  updateStudentLevel: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;
    const { level } = req.body;

    const profile = await userService.updateStudentLevel(studentId, level);

    res.json({
      success: true,
      message: 'Student level updated successfully',
      data: profile,
    });
  }),

  deleteStudent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;

    const result = await userService.deleteStudent(studentId);

    res.json({
      success: true,
      message: result.message,
    });
  }),
};
