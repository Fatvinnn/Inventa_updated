import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import asyncHandler from 'express-async-handler';
import { BorrowingStatus } from '@prisma/client';

// @desc    Get user's borrowings
// @route   GET /api/borrowings/me
// @access  Private
export const getMyBorrowings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;

  const where: any = {
    userId: req.user!.userId,
  };

  if (status && status !== 'all') {
    where.status = status;
  }

  const borrowings = await prisma.borrowing.findMany({
    where,
    include: {
      item: {
        select: {
          id: true,
          name: true,
          image: true,
          category: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: borrowings,
  });
});

// @desc    Get all borrowings (Admin)
// @route   GET /api/borrowings
// @access  Private (Admin only)
export const getAllBorrowings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;

  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  const borrowings = await prisma.borrowing.findMany({
    where,
    include: {
      item: {
        select: {
          id: true,
          name: true,
          image: true,
          category: true,
          location: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          nim: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: borrowings,
  });
});

// @desc    Create new borrowing
// @route   POST /api/borrowings
// @access  Private
export const createBorrowing = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId, quantity, returnDate, notes } = req.body;

  // Check if item exists and has enough availability
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new AppError('Barang tidak ditemukan', 404);
  }

  if (item.available < quantity) {
    throw new AppError(
      `Stok tidak cukup. Tersedia: ${item.available} unit`,
      400
    );
  }

  // Create borrowing and update item availability in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create borrowing with PENDING status (needs admin approval)
    const borrowing = await tx.borrowing.create({
      data: {
        userId: req.user!.userId,
        itemId,
        quantity,
        returnDate: new Date(returnDate),
        notes,
        status: 'PENDING', // Changed from ACTIVE to PENDING
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
            location: true,
          },
        },
      },
    });

    // Update user stats
    await tx.user.update({
      where: { id: req.user!.userId },
      data: {
        totalBorrowings: { increment: 1 },
      },
    });

    return borrowing;
  });

  res.status(201).json({
    success: true,
    message: 'Peminjaman berhasil diajukan. Menunggu persetujuan admin.',
    data: result,
  });
});

// @desc    Update borrowing status
// @route   PUT /api/borrowings/:id/status
// @access  Private (Admin only)
export const updateBorrowingStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Get existing borrowing
  const existingBorrowing = await prisma.borrowing.findUnique({
    where: { id },
    include: {
      item: true,
    },
  });

  if (!existingBorrowing) {
    throw new AppError('Peminjaman tidak ditemukan', 404);
  }

  // If changing to RETURNED, update item availability
  const result = await prisma.$transaction(async (tx) => {
    const updateData: any = {
      status: status as BorrowingStatus,
    };

    // If APPROVING a pending borrowing, deduct stock
    if (status === 'APPROVED' && existingBorrowing.status === 'PENDING') {
      // Deduct item stock
      await tx.item.update({
        where: { id: existingBorrowing.itemId },
        data: {
          available: {
            decrement: existingBorrowing.quantity,
          },
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: existingBorrowing.userId },
        data: {
          activeBorrowings: { increment: 1 },
        },
      });
    }

    // If returning item, set actual return date and restore stock
    if (status === 'RETURNED' && (existingBorrowing.status === 'APPROVED' || existingBorrowing.status === 'OVERDUE')) {
      updateData.actualReturnDate = new Date();

      // Return item stock
      await tx.item.update({
        where: { id: existingBorrowing.itemId },
        data: {
          available: {
            increment: existingBorrowing.quantity,
          },
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: existingBorrowing.userId },
        data: {
          activeBorrowings: { decrement: 1 },
        },
      });
    }

    // Update borrowing
    const borrowing = await tx.borrowing.update({
      where: { id },
      data: updateData,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            nim: true,
            email: true,
          },
        },
      },
    });

    return borrowing;
  });

  res.json({
    success: true,
    message: 'Status peminjaman berhasil diupdate',
    data: result,
  });
});

// @desc    Check and update overdue borrowings
// @route   POST /api/borrowings/check-overdue
// @access  Private (Admin only)
export const checkOverdueBorrowings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update all active borrowings that are past return date
  const result = await prisma.borrowing.updateMany({
    where: {
      status: 'APPROVED', // Changed from ACTIVE to APPROVED
      returnDate: {
        lt: today,
      },
    },
    data: {
      status: 'OVERDUE',
    },
  });

  res.json({
    success: true,
    message: `${result.count} peminjaman diupdate menjadi overdue`,
    data: {
      updated: result.count,
    },
  });
});

// @desc    Get borrowing statistics
// @route   GET /api/borrowings/stats
// @access  Private (Admin only)
export const getBorrowingStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [total, pending, approved, rejected, overdue, returned] = await Promise.all([
    prisma.borrowing.count(),
    prisma.borrowing.count({ where: { status: 'PENDING' } }),
    prisma.borrowing.count({ where: { status: 'APPROVED' } }),
    prisma.borrowing.count({ where: { status: 'REJECTED' } }),
    prisma.borrowing.count({ where: { status: 'OVERDUE' } }),
    prisma.borrowing.count({ where: { status: 'RETURNED' } }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      pending,
      approved,
      rejected,
      overdue,
      returned,
    },
  });
});
