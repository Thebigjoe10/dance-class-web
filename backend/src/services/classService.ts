import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ClassLevel, RegistrationStatus } from '@prisma/client';

export const classService = {
  async createClass(data: {
    name: string;
    style: string;
    level: ClassLevel;
    instructor: string;
    description?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    duration: number;
    capacity: number;
    price?: number;
    startDate: string;
    endDate?: string;
  }) {
    const classRecord = await prisma.class.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return classRecord;
  },

  async getClasses(filters?: {
    level?: ClassLevel;
    isActive?: boolean;
    dayOfWeek?: number;
  }) {
    const where: any = {};

    if (filters?.level) where.level = filters.level;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.dayOfWeek !== undefined) where.dayOfWeek = filters.dayOfWeek;

    const classes = await prisma.class.findMany({
      where,
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return classes.map((classRecord) => ({
      ...classRecord,
      enrolledCount: classRecord._count.registrations,
      availableSpots: classRecord.capacity - classRecord._count.registrations,
    }));
  },

  async getClass(classId: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        registrations: {
          include: {
            student: {
              include: {
                studentProfile: true,
              },
            },
          },
          where: {
            status: 'ACTIVE',
          },
        },
        _count: {
          select: {
            registrations: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }

    return {
      ...classRecord,
      enrolledCount: classRecord._count.registrations,
      availableSpots: classRecord.capacity - classRecord._count.registrations,
    };
  },

  async updateClass(
    classId: string,
    data: Partial<{
      name: string;
      style: string;
      level: ClassLevel;
      instructor: string;
      description: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      duration: number;
      capacity: number;
      price: number;
      isActive: boolean;
      startDate: string;
      endDate: string;
    }>
  ) {
    const updateData: any = { ...data };

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    const classRecord = await prisma.class.update({
      where: { id: classId },
      data: updateData,
    });

    return classRecord;
  },

  async deleteClass(classId: string) {
    await prisma.class.delete({
      where: { id: classId },
    });

    return { message: 'Class deleted successfully' };
  },

  async registerForClass(classId: string, studentId: string) {
    // Check if class exists and is active
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }

    if (!classRecord.isActive) {
      throw new AppError('This class is not currently accepting registrations', 400);
    }

    // Check capacity
    if (classRecord._count.registrations >= classRecord.capacity) {
      throw new AppError('Class is full', 400);
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      include: { studentProfile: true },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Check if already registered
    const existingRegistration = await prisma.classRegistration.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'ACTIVE') {
        throw new AppError('Already registered for this class', 400);
      }

      // Reactivate registration
      const updated = await prisma.classRegistration.update({
        where: { id: existingRegistration.id },
        data: { status: 'ACTIVE' },
        include: {
          class: true,
          student: true,
        },
      });

      return updated;
    }

    // Create new registration
    const registration = await prisma.classRegistration.create({
      data: {
        classId,
        studentId,
        status: 'ACTIVE',
      },
      include: {
        class: true,
        student: true,
      },
    });

    return registration;
  },

  async unregisterFromClass(classId: string, studentId: string) {
    const registration = await prisma.classRegistration.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    await prisma.classRegistration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Successfully unregistered from class' };
  },

  async getClassAttendees(classId: string) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        registrations: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: {
                studentProfile: true,
              },
            },
          },
        },
      },
    });

    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }

    return classRecord.registrations;
  },

  async markAttendance(
    classId: string,
    studentId: string,
    date: Date,
    present: boolean,
    notes?: string
  ) {
    // Check if class and student registration exist
    const registration = await prisma.classRegistration.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId,
        },
      },
    });

    if (!registration || registration.status !== 'ACTIVE') {
      throw new AppError('Student is not registered for this class', 400);
    }

    // Create or update attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        classId_studentId_date: {
          classId,
          studentId,
          date,
        },
      },
      update: {
        present,
        notes,
      },
      create: {
        classId,
        studentId,
        date,
        present,
        notes,
      },
    });

    return attendance;
  },

  async getAttendanceForClass(classId: string, startDate: Date, endDate: Date) {
    const attendance = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return attendance;
  },

  async getStudentClasses(studentId: string) {
    const registrations = await prisma.classRegistration.findMany({
      where: {
        studentId,
        status: 'ACTIVE',
      },
      include: {
        class: true,
      },
      orderBy: {
        class: {
          dayOfWeek: 'asc',
        },
      },
    });

    return registrations;
  },
};
