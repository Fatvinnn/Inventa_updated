import api, { ApiResponse } from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  createdAt: string;
}

class CategoryService {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch categories');
  }

  // Get single category
  async getCategory(id: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch category');
  }

  // Create category (admin only)
  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create category');
  }

  // Update category (admin only)
  async updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update category');
  }

  // Delete category (admin only)
  async deleteCategory(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/categories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete category');
    }
  }
}

export default new CategoryService();
