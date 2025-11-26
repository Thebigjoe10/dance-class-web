import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { notificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';

export const notificationController = {
  getNotifications: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { read } = req.query;

    const filters: any = {};
    if (read !== undefined) filters.read = read === 'true';

    const notifications = await notificationService.getUserNotifications(userId, filters);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  }),

  getUnreadCount: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  }),

  markAsRead: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  }),

  markAllAsRead: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: result.message,
    });
  }),

  deleteNotification: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { notificationId } = req.params;

    const result = await notificationService.deleteNotification(notificationId, userId);

    res.json({
      success: true,
      message: result.message,
    });
  }),

  sendBroadcast: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, body, type, userIds, sendToAll, sendEmail } = req.body;

    const result = await notificationService.sendBroadcastNotification({
      title,
      body,
      type,
      userIds,
      sendToAll,
      sendEmail,
    });

    res.json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  }),

  sendClassReminders: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { hoursBeforeClass } = req.body;

    const result = await notificationService.sendClassReminders(hoursBeforeClass || 24);

    res.json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  }),
};
