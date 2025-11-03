import { body } from 'express-validator';

export const createBorrowingValidator = [
  body('itemId').trim().notEmpty().withMessage('Item ID tidak boleh kosong'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity harus minimal 1'),
  body('returnDate')
    .notEmpty()
    .withMessage('Tanggal pengembalian harus diisi')
    .isISO8601()
    .withMessage('Format tanggal tidak valid')
    .custom((value) => {
      const returnDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (returnDate < today) {
        throw new Error('Tanggal pengembalian tidak boleh di masa lalu');
      }
      return true;
    }),
  body('notes').optional().trim(),
];

export const updateBorrowingStatusValidator = [
  body('status')
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'OVERDUE'])
    .withMessage('Status harus PENDING, APPROVED, REJECTED, RETURNED, atau OVERDUE'),
];
