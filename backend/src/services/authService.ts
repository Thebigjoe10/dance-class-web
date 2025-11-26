import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateVerificationToken } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/email';
import { AppError } from '../middleware/errorHandler';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user with student profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: 'STUDENT',
        verificationToken,
        studentProfile: {
          create: {},
        },
      },
      include: {
        studentProfile: true,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(data.email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      token,
    };
  },

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
        level: user.studentProfile?.level,
      },
      token,
    };
  },

  async verifyEmail(token: string) {
    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null,
      },
    });

    return {
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        verified: updatedUser.verified,
      },
    };
  },

  async createAdminUser(data: {
    email: string;
    password: string;
    name: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'ADMIN',
        verified: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
};
