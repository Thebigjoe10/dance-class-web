import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ClassLevel } from '@prisma/client';

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      studentProfile: user.studentProfile,
    };
  },

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      guardianName?: string;
      dateOfBirth?: string;
      address?: string;
      emergencyContact?: string;
      medicalInfo?: string;
    }
  ) {
    // Update user basic info
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        studentProfile: true,
      },
    });

    // Update student profile if exists
    if (user.studentProfile) {
      const profileData: any = {};
      if (data.guardianName) profileData.guardianName = data.guardianName;
      if (data.dateOfBirth) profileData.dateOfBirth = new Date(data.dateOfBirth);
      if (data.address) profileData.address = data.address;
      if (data.emergencyContact) profileData.emergencyContact = data.emergencyContact;
      if (data.medicalInfo) profileData.medicalInfo = data.medicalInfo;

      if (Object.keys(profileData).length > 0) {
        await prisma.studentProfile.update({
          where: { userId },
          data: profileData,
        });
      }
    }

    return this.getProfile(userId);
  },

  async getAllStudents(filters?: { level?: ClassLevel; verified?: boolean }) {
    const where: any = {
      role: 'STUDENT',
    };

    if (filters?.verified !== undefined) {
      where.verified = filters.verified;
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        studentProfile: true,
        classRegistrations: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter by level if specified
    if (filters?.level) {
      return students.filter(
        (student) => student.studentProfile?.level === filters.level
      );
    }

    return students;
  },

  async getStudent(studentId: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      include: {
        studentProfile: true,
        classRegistrations: {
          include: {
            class: true,
          },
        },
        tickets: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return student;
  },

  async updateStudentLevel(studentId: string, level: ClassLevel) {
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
      include: { studentProfile: true },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (!student.studentProfile) {
      throw new AppError('Student profile not found', 404);
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: studentId },
      data: { level },
    });

    return updatedProfile;
  },

  async deleteStudent(studentId: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'STUDENT' },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    await prisma.user.delete({
      where: { id: studentId },
    });

    return { message: 'Student deleted successfully' };
  },
};
