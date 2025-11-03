import api, { ApiResponse, PaginatedResponse } from './api';
import { Item } from '../types';

export interface ItemFilters {
  search?: string;
  category?: string;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  status?: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'RETIRED';
  page?: number;
  limit?: number;
}

export interface CreateItemData {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  location?: string;
  imageUrl?: string;
}

export interface UpdateItemData extends Partial<CreateItemData> {
  status?: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'RETIRED';
}

class ItemService {
  // Get all items with filters
  async getItems(filters?: ItemFilters): Promise<PaginatedResponse<Item>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<Item>>(`/items?${params.toString()}`);
    return response.data;
  }

  // Get single item by ID
  async getItem(id: string): Promise<Item> {
    const response = await api.get<ApiResponse<Item>>(`/items/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch item');
  }

  // Get popular items
  async getPopularItems(limit: number = 10): Promise<Item[]> {
    const response = await api.get<ApiResponse<Item[]>>(`/items/popular?limit=${limit}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch popular items');
  }

  // Create new item (admin only)
  async createItem(data: CreateItemData): Promise<Item> {
    const response = await api.post<ApiResponse<Item>>('/items', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create item');
  }

  // Update item (admin only)
  async updateItem(id: string, data: UpdateItemData): Promise<Item> {
    const response = await api.put<ApiResponse<Item>>(`/items/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update item');
  }

  // Delete item (admin only)
  async deleteItem(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/items/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete item');
    }
  }

  // Upload item image (admin only)
  async uploadImage(id: string, imageUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'item-image.jpg',
    } as any);

    const response = await api.post<ApiResponse<{ imageUrl: string }>>(
      `/items/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data.imageUrl;
    }
    throw new Error(response.data.error || 'Failed to upload image');
  }
}

export default new ItemService();
