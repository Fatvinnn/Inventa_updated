import { Router } from 'express';
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllCategories);

// Admin routes
router.post('/', authenticate, requireAdmin, createCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;
