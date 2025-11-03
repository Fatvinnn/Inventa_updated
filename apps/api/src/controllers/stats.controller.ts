import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import asyncHandler from 'express-async-handler';

// @desc    Get user dashboard stats
// @route   GET /api/stats/dashboard/user
// @route   GET /api/stats (alias)
// @route   GET /api/stats/user/me (alias)
// @access  Private
export const getUserDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const [totalItems, availableItems, borrowedCount, userBorrowings] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({
      where: {
        available: { gt: 0 },
      },
    }),
    prisma.item.aggregate({
      _sum: {
        total: true,
        available: true,
      },
    }),
    Promise.all([
      prisma.borrowing.count({ where: { userId } }),
      prisma.borrowing.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.borrowing.count({ where: { userId, status: 'RETURNED' } }),
      prisma.borrowing.count({ where: { userId, status: 'OVERDUE' } }),
    ]),
  ]);

  const borrowed = (borrowedCount._sum.total || 0) - (borrowedCount._sum.available || 0);

  res.json({
    success: true,
    data: {
      totalItems,
      availableItems: availableItems,
      borrowedItems: borrowed,
      totalBorrowings: userBorrowings[0],
      activeBorrowings: userBorrowings[1],
      overdueItems: userBorrowings[3],
      completedBorrowings: userBorrowings[2],
    },
  });
});

// @desc    Get admin dashboard stats
// @route   GET /api/stats/dashboard/admin
// @access  Private (Admin only)
export const getAdminDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [itemStats, borrowingStats] = await Promise.all([
    prisma.item.aggregate({
      _count: true,
      _sum: {
        total: true,
        available: true,
      },
    }),
    Promise.all([
      prisma.borrowing.count({ where: { status: 'ACTIVE' } }),
      prisma.borrowing.count({ where: { status: 'OVERDUE' } }),
    ]),
  ]);

  const totalStock = itemStats._sum.total || 0;
  const availableStock = itemStats._sum.available || 0;
  const borrowedStock = totalStock - availableStock;

  res.json({
    success: true,
    data: {
      totalItems: itemStats._count,
      totalStock,
      availableStock,
      borrowedStock,
      activeBorrowings: borrowingStats[0],
      overdueBorrowings: borrowingStats[1],
    },
  });
});

// @desc    Get recent activities
// @route   GET /api/stats/activities/recent
// @route   GET /api/stats/activities (alias)
// @access  Private (Admin only)
export const getRecentActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '10' } = req.query;
  const limitNum = parseInt(limit as string);

  const borrowings = await prisma.borrowing.findMany({
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    include: {
      item: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          nim: true,
        },
      },
    },
  });

  // Transform to Activity format
  const activities = borrowings.map(borrowing => {
    let type: 'BORROW' | 'RETURN' | 'APPROVE' | 'REJECT' = 'BORROW';
    let actionText = 'mengajukan peminjaman';

    if (borrowing.status === 'ACTIVE') {
      type = 'APPROVE';
      actionText = 'meminjam';
    } else if (borrowing.status === 'RETURNED') {
      type = 'RETURN';
      actionText = 'mengembalikan';
    } else if (borrowing.status === 'OVERDUE') {
      type = 'BORROW';
      actionText = 'terlambat mengembalikan';
    }

    return {
      id: borrowing.id,
      type,
      description: `${borrowing.user.name} ${actionText} ${borrowing.item.name}`,
      timestamp: borrowing.createdAt.toISOString(),
      userId: borrowing.userId,
      userName: borrowing.user.name,
      itemId: borrowing.itemId,
      itemName: borrowing.item.name,
    };
  });

  res.json({
    success: true,
    data: activities,
  });
});
