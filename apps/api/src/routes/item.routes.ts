import { Router } from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getPopularItems,
} from '../controllers/item.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { createItemValidator, updateItemValidator } from '../validators/item.validator';

const router = Router();

// Public routes
router.get('/', getAllItems);
router.get('/popular', getPopularItems);
router.get('/:id', getItemById);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createItemValidator), createItem);
router.put('/:id', authenticate, requireAdmin, validate(updateItemValidator), updateItem);
router.delete('/:id', authenticate, requireAdmin, deleteItem);

export default router;
