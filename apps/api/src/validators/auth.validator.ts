import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('nim')
    .trim()
    .notEmpty()
    .withMessage('NIM tidak boleh kosong')
    .isLength({ min: 5 })
    .withMessage('NIM minimal 5 karakter'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email tidak boleh kosong')
    .isEmail()
    .withMessage('Format email tidak valid'),
  body('password')
    .notEmpty()
    .withMessage('Password tidak boleh kosong')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('phone').optional().trim(),
  body('faculty').optional().trim(),
  body('program').optional().trim(),
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email tidak boleh kosong'),
  body('password').notEmpty().withMessage('Password tidak boleh kosong'),
];

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('phone').optional().trim(),
  body('faculty').optional().trim(),
  body('program').optional().trim(),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Password lama harus diisi'),
  body('newPassword')
    .notEmpty()
    .withMessage('Password baru harus diisi')
    .isLength({ min: 6 })
    .withMessage('Password baru minimal 6 karakter'),
];
