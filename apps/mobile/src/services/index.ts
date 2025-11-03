export { default as authService } from './auth.service';
export { default as itemService } from './item.service';
export { default as borrowingService } from './borrowing.service';
export { default as statsService } from './stats.service';
export { default as categoryService } from './category.service';
export { default as api, handleApiError } from './api';

export type { LoginCredentials, RegisterData, AuthResponse } from './auth.service';
export type { ItemFilters, CreateItemData, UpdateItemData } from './item.service';
export type { BorrowingFilters, CreateBorrowingData, UpdateBorrowingData } from './borrowing.service';
export type { Stats, Activity } from './stats.service';
export type { Category } from './category.service';
