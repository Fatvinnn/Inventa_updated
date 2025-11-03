import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import asyncHandler from 'express-async-handler';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getAllItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, category, available, page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (category && category !== 'Semua') {
    where.category = category;
  }

  if (available === 'true') {
    where.available = { gt: 0 };
  }

  // Get items with pagination
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.item.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public
export const getItemById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!item) {
    throw new AppError('Barang tidak ditemukan', 404);
  }

  res.json({
    success: true,
    data: item,
  });
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private (Admin only)
export const createItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, category, description, image, total, available, condition, location } = req.body;

  const item = await prisma.item.create({
    data: {
      name,
      category,
      description,
      image: image || '📦',
      total,
      available,
      condition: condition || 'BAIK',
      location,
      createdById: req.user!.userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Barang berhasil ditambahkan',
    data: item,
  });
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Admin only)
export const updateItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, category, description, image, total, available, condition, location } = req.body;

  // Check if item exists
  const existingItem = await prisma.item.findUnique({ where: { id } });

  if (!existingItem) {
    throw new AppError('Barang tidak ditemukan', 404);
  }

  // Update item
  const item = await prisma.item.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(total !== undefined && { total }),
      ...(available !== undefined && { available }),
      ...(condition && { condition }),
      ...(location && { location }),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Barang berhasil diupdate',
    data: item,
  });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Admin only)
export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if item exists
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      borrowings: {
        where: {
          status: { in: ['APPROVED', 'OVERDUE'] },
        },
      },
    },
  });

  if (!item) {
    throw new AppError('Barang tidak ditemukan', 404);
  }

  // Check if item has active borrowings
  if (item.borrowings.length > 0) {
    throw new AppError(
      'Tidak dapat menghapus barang yang sedang dipinjam',
      400
    );
  }

  // Delete item
  await prisma.item.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Barang berhasil dihapus',
  });
});

// @desc    Get popular items (most borrowed)
// @route   GET /api/items/popular
// @access  Public
export const getPopularItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '4' } = req.query;
  const limitNum = parseInt(limit as string);

  // Get items sorted by (total - available) which indicates how many are borrowed
  const items = await prisma.item.findMany({
    take: limitNum,
    orderBy: {
      available: 'asc', // Items with less available are more popular
    },
    where: {
      total: { gt: 0 },
    },
  });

  res.json({
    success: true,
    data: items,
  });
});
