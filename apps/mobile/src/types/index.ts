export interface Item {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  available: number;
  total: number;
  condition: 'Baik' | 'Cukup' | 'Rusak';
  location: string;
}

export interface Borrowing {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  borrowDate: string;
  returnDate: string;
  status: 'active' | 'returned' | 'overdue';
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  nim: string;
  email: string;
  phone: string;
  faculty: string;
  program: string;
  totalBorrowings: number;
  activeBorrowings: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  ItemDetail: { item: Item };
  BorrowForm: { item: Item };
};

export type MainTabParamList = {
  Home: undefined;
  Items: undefined;
  MyBorrowings: undefined;
  Profile: undefined;
};
