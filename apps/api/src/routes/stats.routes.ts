import { Router } from 'express';
import {
  getUserDashboardStats,
  getAdminDashboardStats,
  getRecentActivities,
} from '../controllers/stats.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// General stats (combines user & admin stats for convenience)
router.get('/', authenticate, getUserDashboardStats);

// User stats
router.get('/dashboard/user', authenticate, getUserDashboardStats);
router.get('/user/me', authenticate, getUserDashboardStats);

// Admin stats
router.get('/dashboard/admin', authenticate, requireAdmin, getAdminDashboardStats);
router.get('/activities', authenticate, requireAdmin, getRecentActivities);
router.get('/activities/recent', authenticate, requireAdmin, getRecentActivities);

export default router;
