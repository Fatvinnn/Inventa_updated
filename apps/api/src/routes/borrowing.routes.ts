import { Router } from 'express';
import {
  getMyBorrowings,
  getAllBorrowings,
  createBorrowing,
  updateBorrowingStatus,
  checkOverdueBorrowings,
  getBorrowingStats,
} from '../controllers/borrowing.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import {
  createBorrowingValidator,
  updateBorrowingStatusValidator,
} from '../validators/borrowing.validator';

const router = Router();

// User routes
router.get('/me', authenticate, getMyBorrowings);
router.get('/my', authenticate, getMyBorrowings); // Alias for /me
router.post('/', authenticate, validate(createBorrowingValidator), createBorrowing);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllBorrowings);
router.put('/:id/status', authenticate, requireAdmin, validate(updateBorrowingStatusValidator), updateBorrowingStatus);
router.put('/:id', authenticate, requireAdmin, validate(updateBorrowingStatusValidator), updateBorrowingStatus); // Alias for /:id/status
router.post('/check-overdue', authenticate, requireAdmin, checkOverdueBorrowings);
router.get('/stats', authenticate, requireAdmin, getBorrowingStats);

export default router;
