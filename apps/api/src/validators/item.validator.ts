import { body } from 'express-validator';

export const createItemValidator = [
  body('name').trim().notEmpty().withMessage('Nama barang tidak boleh kosong'),
  body('category').trim().notEmpty().withMessage('Kategori tidak boleh kosong'),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('total')
    .isInt({ min: 0 })
    .withMessage('Total harus berupa angka positif'),
  body('available')
    .isInt({ min: 0 })
    .withMessage('Available harus berupa angka positif')
    .custom((value, { req }) => {
      if (value > req.body.total) {
        throw new Error('Available tidak boleh lebih besar dari total');
      }
      return true;
    }),
  body('condition')
    .optional()
    .isIn(['BAIK', 'CUKUP', 'RUSAK'])
    .withMessage('Condition harus BAIK, CUKUP, atau RUSAK'),
  body('location').trim().notEmpty().withMessage('Lokasi tidak boleh kosong'),
];

export const updateItemValidator = [
  body('name').optional().trim().notEmpty().withMessage('Nama barang tidak boleh kosong'),
  body('category').optional().trim().notEmpty().withMessage('Kategori tidak boleh kosong'),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('total').optional().isInt({ min: 0 }).withMessage('Total harus berupa angka positif'),
  body('available').optional().isInt({ min: 0 }).withMessage('Available harus berupa angka positif'),
  body('condition')
    .optional()
    .isIn(['BAIK', 'CUKUP', 'RUSAK'])
    .withMessage('Condition harus BAIK, CUKUP, atau RUSAK'),
  body('location').optional().trim().notEmpty().withMessage('Lokasi tidak boleh kosong'),
];
