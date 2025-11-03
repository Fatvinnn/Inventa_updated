// API Types matching backend schema
export interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string;
  categoryId: string;
  quantity: number;
  availableQuantity: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'RETIRED';
  location: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  borrowCount?: number;
}

export interface Borrowing {
  id: string;
  userId: string;
  itemId: string;
  item?: Item;
  user?: User;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE';
  purpose: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  nim: string;
  email: string;
  phone: string | null;
  faculty: string | null;
  program: string | null;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  totalBorrowings?: number;
  activeBorrowings?: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  ItemDetail: { item: Item };
  BorrowForm: { item: Item };
  AddItem: undefined;
  EditItem?: { item: Item };
};

export type MainTabParamList = {
  Home: undefined;
  Items: undefined;
  MyBorrowings: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  ManageItems: undefined;
  ManageBorrowings: undefined;
  AdminProfile: undefined;
};
