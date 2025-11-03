import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import asyncHandler from 'express-async-handler';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: categories,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, icon } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      icon,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Kategori berhasil ditambahkan',
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if category is being used by items
  const itemsCount = await prisma.item.count({
    where: { category: id },
  });

  if (itemsCount > 0) {
    throw new AppError(
      'Tidak dapat menghapus kategori yang masih digunakan oleh barang',
      400
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Kategori berhasil dihapus',
  });
});
