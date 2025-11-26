import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { classService } from '../services/classService';
import { AuthRequest } from '../middleware/auth';

export const classController = {
  createClass: asyncHandler(async (req: AuthRequest, res: Response) => {
    const classRecord = await classService.createClass(req.body);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classRecord,
    });
  }),

  getClasses: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { level, isActive, dayOfWeek } = req.query;

    const filters: any = {};
    if (level) filters.level = level;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (dayOfWeek !== undefined) filters.dayOfWeek = parseInt(dayOfWeek as string);

    const classes = await classService.getClasses(filters);

    res.json({
      success: true,
      data: classes,
      count: classes.length,
    });
  }),

  getClass: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;

    const classRecord = await classService.getClass(classId);

    res.json({
      success: true,
      data: classRecord,
    });
  }),

  updateClass: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;

    const classRecord = await classService.updateClass(classId, req.body);

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classRecord,
    });
  }),

  deleteClass: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;

    const result = await classService.deleteClass(classId);

    res.json({
      success: true,
      message: result.message,
    });
  }),

  registerForClass: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;
    const studentId = req.user!.userId;

    const registration = await classService.registerForClass(classId, studentId);

    res.status(201).json({
      success: true,
      message: 'Successfully registered for class',
      data: registration,
    });
  }),

  unregisterFromClass: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;
    const studentId = req.user!.userId;

    const result = await classService.unregisterFromClass(classId, studentId);

    res.json({
      success: true,
      message: result.message,
    });
  }),

  getClassAttendees: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;

    const attendees = await classService.getClassAttendees(classId);

    res.json({
      success: true,
      data: attendees,
      count: attendees.length,
    });
  }),

  markAttendance: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId, studentId } = req.params;
    const { date, present, notes } = req.body;

    const attendance = await classService.markAttendance(
      classId,
      studentId,
      new Date(date),
      present,
      notes
    );

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  }),

  getAttendance: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    const attendance = await classService.getAttendanceForClass(
      classId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: attendance,
      count: attendance.length,
    });
  }),

  getStudentClasses: asyncHandler(async (req: AuthRequest, res: Response) => {
    const studentId = req.user!.userId;

    const classes = await classService.getStudentClasses(studentId);

    res.json({
      success: true,
      data: classes,
      count: classes.length,
    });
  }),
};
