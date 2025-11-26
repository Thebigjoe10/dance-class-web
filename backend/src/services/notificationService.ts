import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { NotificationType } from '@prisma/client';
import { sendEmail, sendClassReminderEmail } from '../utils/email';

export const notificationService = {
  async createNotification(data: {
    userId?: string;
    type: NotificationType;
    title: string;
    body: string;
    meta?: any;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        meta: data.meta,
      },
    });

    return notification;
  },

  async getUserNotifications(userId: string, filters?: { read?: boolean }) {
    const where: any = { userId };

    if (filters?.read !== undefined) {
      where.read = filters.read;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted' };
  },

  async sendBroadcastNotification(data: {
    title: string;
    body: string;
    type: NotificationType;
    userIds?: string[];
    sendToAll?: boolean;
    sendEmail?: boolean;
  }) {
    const notifications = [];

    if (data.sendToAll) {
      // Get all students
      const users = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true, email: true, name: true },
      });

      for (const user of users) {
        const notification = await this.createNotification({
          userId: user.id,
          type: data.type,
          title: data.title,
          body: data.body,
        });

        notifications.push(notification);

        // Send email if requested
        if (data.sendEmail) {
          try {
            await sendEmail({
              to: user.email,
              subject: data.title,
              html: `
                <h2>${data.title}</h2>
                <p>${data.body}</p>
              `,
              text: `${data.title}\n\n${data.body}`,
            });
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
          }
        }
      }
    } else if (data.userIds && data.userIds.length > 0) {
      // Send to specific users
      const users = await prisma.user.findMany({
        where: { id: { in: data.userIds } },
        select: { id: true, email: true, name: true },
      });

      for (const user of users) {
        const notification = await this.createNotification({
          userId: user.id,
          type: data.type,
          title: data.title,
          body: data.body,
        });

        notifications.push(notification);

        // Send email if requested
        if (data.sendEmail) {
          try {
            await sendEmail({
              to: user.email,
              subject: data.title,
              html: `
                <h2>${data.title}</h2>
                <p>${data.body}</p>
              `,
              text: `${data.title}\n\n${data.body}`,
            });
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
          }
        }
      }
    }

    return {
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length,
    };
  },

  async sendClassReminders(hoursBeforeClass: number = 24) {
    // Get classes happening in the next X hours
    const now = new Date();
    const targetTime = new Date(now.getTime() + hoursBeforeClass * 60 * 60 * 1000);

    // Find classes for today's day of week
    const dayOfWeek = targetTime.getDay();

    const classes = await prisma.class.findMany({
      where: {
        isActive: true,
        dayOfWeek,
      },
      include: {
        registrations: {
          where: { status: 'ACTIVE' },
          include: {
            student: true,
          },
        },
      },
    });

    let remindersSent = 0;

    for (const classRecord of classes) {
      for (const registration of classRecord.registrations) {
        // Create in-app notification
        await this.createNotification({
          userId: registration.studentId,
          type: 'CLASS_REMINDER',
          title: `Upcoming Class: ${classRecord.name}`,
          body: `Your ${classRecord.name} class is scheduled for today at ${classRecord.startTime}`,
          meta: {
            classId: classRecord.id,
            className: classRecord.name,
            startTime: classRecord.startTime,
          },
        });

        // Send email reminder
        try {
          await sendClassReminderEmail(registration.student.email, {
            studentName: registration.student.name,
            className: classRecord.name,
            classDate: 'Today',
            classTime: classRecord.startTime,
            instructor: classRecord.instructor,
          });
          remindersSent++;
        } catch (error) {
          console.error('Failed to send class reminder email:', error);
        }
      }
    }

    return {
      message: `Sent ${remindersSent} class reminders`,
      count: remindersSent,
    };
  },

  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  },
};
