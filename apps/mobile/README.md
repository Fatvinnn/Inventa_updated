# Inventa Mobile

Aplikasi mobile untuk sistem peminjaman barang kampus yang dibangun dengan **React Native** dan **Expo**.

## 📱 Fitur Aplikasi

### 1. **Beranda (Home)**
- Dashboard dengan statistik peminjaman
- Menu cepat untuk akses fitur utama
- Daftar barang populer

### 2. **Daftar Barang (Items)**
- Pencarian barang
- Filter berdasarkan kategori:
  - Elektronik
  - Olahraga
  - Laboratorium
  - Multimedia
  - Furniture
  - Alat Tulis
- Informasi ketersediaan real-time
- Detail lokasi barang

### 3. **Detail Barang**
- Informasi lengkap barang
- Status kondisi barang (Baik, Cukup, Rusak)
- Ketersediaan stok
- Lokasi penyimpanan
- Form peminjaman dengan quantity selector

### 4. **Peminjaman Saya**
- Daftar barang yang sedang dipinjam
- Riwayat peminjaman
- Filter: Semua, Aktif, Selesai
- Tanggal pinjam dan kembali
- Status peminjaman (Aktif, Dikembalikan, Terlambat)

### 5. **Profil**
- Informasi mahasiswa:
  - Nama & NIM
  - Email & No. Telepon
  - Fakultas & Program Studi
- Menu pengaturan
- Panduan penggunaan

## 🗂️ Struktur Folder

```
apps/mobile/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ItemCard.tsx
│   │   ├── BorrowingCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── index.ts
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ItemsScreen.tsx
│   │   ├── ItemDetailScreen.tsx
│   │   ├── MyBorrowingsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── index.ts
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── constants/           # Constants & theme
│   │   └── theme.ts
│   └── data/                # Mock data
│       └── mockData.ts
├── App.tsx                  # Entry point
├── app.json                 # Expo config
├── package.json
└── tsconfig.json
```

## 🎨 Design System

### Colors
- **Primary**: `#007AFF` (Blue)
- **Secondary**: `#5856D6` (Purple)
- **Success**: `#34C759` (Green)
- **Warning**: `#FF9500` (Orange)
- **Danger**: `#FF3B30` (Red)
- **Background**: `#F2F2F7` (Light Gray)

### Components
- **ItemCard**: Menampilkan item dengan gambar, nama, kategori, dan status
- **BorrowingCard**: Menampilkan informasi peminjaman
- **SearchBar**: Input pencarian dengan icon
- **CategoryFilter**: Horizontal scroll filter chips

## 📊 Mock Data

Aplikasi menggunakan data statis untuk development:

### Barang (8 items)
- Laptop ASUS ROG
- Kamera Canon EOS
- Proyektor Epson
- Bola Basket Molten
- Mikroskop Digital
- Tripod Kamera
- Arduino Kit
- Papan Whiteboard

### Peminjaman (3 items)
- 2 peminjaman aktif
- 1 peminjaman selesai

## 🚀 Development

### Install dependencies
```bash
pnpm install
```

### Start Expo
```bash
pnpm dev
```

### Run on platform
```bash
# Android
pnpm android

# iOS
pnpm ios

# Web
pnpm web
```

## 🧭 Navigation

Aplikasi menggunakan **React Navigation v6**:

### Stack Navigator
- MainTabs (Bottom Tabs)
- ItemDetail

### Bottom Tab Navigator
- Home (Beranda)
- Items (Daftar Barang)
- MyBorrowings (Peminjaman Saya)
- Profile (Profil)

## 📝 TypeScript Types

```typescript
// Item untuk barang yang bisa dipinjam
interface Item {
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

// Borrowing untuk peminjaman
interface Borrowing {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  borrowDate: string;
  returnDate: string;
  status: 'active' | 'returned' | 'overdue';
  quantity: number;
}

// User untuk profil mahasiswa
interface User {
  id: string;
  name: string;
  nim: string;
  email: string;
  phone: string;
  faculty: string;
  program: string;
}
```

## 🔄 Next Steps (API Integration)

Untuk integrasi dengan backend API:

1. **Setup Axios Configuration**
   ```typescript
   // src/services/api.ts
   import axios from 'axios';
   
   export const api = axios.create({
     baseURL: process.env.API_URL || 'http://localhost:3000',
   });
   ```

2. **Replace Mock Data**
   - Ganti `MOCK_ITEMS` dengan API calls
   - Ganti `MOCK_BORROWINGS` dengan data dari server
   - Implementasi authentication

3. **State Management**
   - Tambahkan Context API atau Redux
   - Implement caching dengan React Query

## 📱 Screenshots Placeholder

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Home Screen   │  │  Items Screen   │  │  Detail Screen  │
│                 │  │                 │  │                 │
│  📊 Stats       │  │  🔍 Search      │  │  💻 Image       │
│  ⚡ Quick Menu  │  │  📦 Item List   │  │  ℹ️ Info        │
│  ⭐ Popular     │  │  🏷️ Categories  │  │  📍 Location    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🛠️ Tech Stack

- **React Native** 0.73.0
- **Expo** ~50.0.0
- **React Navigation** 6.x
- **TypeScript** 5.3.3
- **Expo Vector Icons** 14.0.0

## 📄 License

Private - Inventa Campus Borrowing System
