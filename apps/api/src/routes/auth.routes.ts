import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
// Get current user profile
router.get('/me', authenticate, getMe);
router.get('/profile', authenticate, getMe); // Alias for /me

// Update profile
router.put('/me', authenticate, validate(updateProfileValidator), updateProfile);
router.put('/profile', authenticate, validate(updateProfileValidator), updateProfile); // Alias for /me

// Change password
router.put('/password', authenticate, validate(changePasswordValidator), changePassword);

export default router;
