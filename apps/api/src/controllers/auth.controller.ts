import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import asyncHandler from 'express-async-handler';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, nim, email, password, phone, faculty, program, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { nim }],
    },
  });

  if (existingUser) {
    throw new AppError('Email atau NIM sudah terdaftar', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      nim,
      email,
      password: hashedPassword,
      phone,
      faculty,
      program,
      role: role || 'USER', // Default to USER if not specified
    },
    select: {
      id: true,
      name: true,
      nim: true,
      email: true,
      phone: true,
      faculty: true,
      program: true,
      role: true,
      totalBorrowings: true,
      activeBorrowings: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: {
      user,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  // Find user by email or NIM
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { nim: email }],
    },
  });

  if (!user) {
    throw new AppError('Email/NIM atau password salah', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Email/NIM atau password salah', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      nim: true,
      email: true,
      phone: true,
      faculty: true,
      program: true,
      role: true,
      avatarUrl: true,
      totalBorrowings: true,
      activeBorrowings: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, faculty, program } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(faculty !== undefined && { faculty }),
      ...(program !== undefined && { program }),
    },
    select: {
      id: true,
      name: true,
      nim: true,
      email: true,
      phone: true,
      faculty: true,
      program: true,
      role: true,
      totalBorrowings: true,
      activeBorrowings: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Profil berhasil diupdate',
    data: user,
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Password lama salah', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.json({
    success: true,
    message: 'Password berhasil diubah',
  });
});
