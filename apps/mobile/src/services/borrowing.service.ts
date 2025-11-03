import api, { ApiResponse, PaginatedResponse } from './api';
import { Borrowing } from '../types';

export interface BorrowingFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE';
  userId?: string;
  itemId?: string;
  page?: number;
  limit?: number;
}

export interface CreateBorrowingData {
  itemId: string;
  quantity: number;
  borrowDate: string; // ISO date string
  returnDate: string; // ISO date string
  purpose?: string;
}

export interface UpdateBorrowingData {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE';
  actualReturnDate?: string; // ISO date string
  notes?: string;
}

class BorrowingService {
  // Get all borrowings with filters
  async getBorrowings(filters?: BorrowingFilters): Promise<PaginatedResponse<Borrowing>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.itemId) params.append('itemId', filters.itemId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<Borrowing>>(`/borrowings?${params.toString()}`);
    return response.data;
  }

  // Get my borrowings (current user)
  async getMyBorrowings(filters?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Borrowing>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<Borrowing>>(`/borrowings/my?${params.toString()}`);
    return response.data;
  }

  // Get single borrowing by ID
  async getBorrowing(id: string): Promise<Borrowing> {
    const response = await api.get<ApiResponse<Borrowing>>(`/borrowings/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch borrowing');
  }

  // Create new borrowing request
  async createBorrowing(data: CreateBorrowingData): Promise<Borrowing> {
    const response = await api.post<ApiResponse<Borrowing>>('/borrowings', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create borrowing request');
  }

  // Update borrowing (admin only)
  async updateBorrowing(id: string, data: UpdateBorrowingData): Promise<Borrowing> {
    const response = await api.put<ApiResponse<Borrowing>>(`/borrowings/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update borrowing');
  }

  // Approve borrowing (admin only)
  async approveBorrowing(id: string, notes?: string): Promise<Borrowing> {
    return this.updateBorrowing(id, { status: 'APPROVED', notes });
  }

  // Reject borrowing (admin only)
  async rejectBorrowing(id: string, notes?: string): Promise<Borrowing> {
    return this.updateBorrowing(id, { status: 'REJECTED', notes });
  }

  // Mark as returned (admin only)
  async returnBorrowing(id: string, notes?: string): Promise<Borrowing> {
    return this.updateBorrowing(id, {
      status: 'RETURNED',
      actualReturnDate: new Date().toISOString(),
      notes,
    });
  }

  // Cancel borrowing (user can cancel their own pending requests)
  async cancelBorrowing(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/borrowings/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to cancel borrowing');
    }
  }
}

export default new BorrowingService();
