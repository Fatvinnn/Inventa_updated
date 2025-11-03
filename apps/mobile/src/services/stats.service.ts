import api, { ApiResponse } from './api';

export interface Stats {
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  totalBorrowings: number;
  activeBorrowings: number;
  overdueItems: number;
  totalUsers?: number;
  activeUsers?: number;
}

export interface Activity {
  id: string;
  type: 'BORROW' | 'RETURN' | 'APPROVE' | 'REJECT';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  itemId?: string;
  itemName?: string;
}

class StatsService {
  // Get overall statistics
  async getStats(): Promise<Stats> {
    const response = await api.get<ApiResponse<Stats>>('/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch statistics');
  }

  // Get recent activities (admin only)
  async getActivities(limit: number = 20): Promise<Activity[]> {
    const response = await api.get<ApiResponse<Activity[]>>(`/stats/activities?limit=${limit}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch activities');
  }

  // Get user statistics (for profile page)
  async getUserStats(userId?: string): Promise<{
    totalBorrowings: number;
    activeBorrowings: number;
    completedBorrowings: number;
    overdueItems: number;
  }> {
    const endpoint = userId ? `/stats/user/${userId}` : '/stats/user/me';
    const response = await api.get<ApiResponse<any>>(endpoint);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user statistics');
  }
}

export default new StatsService();
