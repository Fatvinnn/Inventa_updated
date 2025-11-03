# 📚 Dokumentasi Implementasi Supabase Backend

## 📋 Daftar Isi
1. [Setup Supabase Project](#setup-supabase-project)
2. [Database Schema](#database-schema)
3. [Row Level Security (RLS)](#row-level-security)
4. [Setup Supabase Client](#setup-supabase-client)
5. [Authentication Implementation](#authentication-implementation)
6. [CRUD Operations](#crud-operations)
7. [Real-time Features](#real-time-features)
8. [Storage untuk Images](#storage-untuk-images)

---

## 🚀 Setup Supabase Project

### 1. Buat Akun Supabase
1. Kunjungi [https://supabase.com](https://supabase.com)
2. Klik "Start your project" dan login dengan GitHub
3. Klik "New Project"
4. Isi detail project:
   - **Name**: Inventa
   - **Database Password**: (Simpan password ini dengan aman!)
   - **Region**: Southeast Asia (Singapore) - untuk performa terbaik
   - **Plan**: Free tier (untuk development)
5. Tunggu ~2 menit hingga project selesai dibuat

### 2. Install Dependencies
```bash
cd apps/mobile
pnpm add @supabase/supabase-js
pnpm add react-native-url-polyfill
pnpm add @react-native-async-storage/async-storage
```

---

## 🗄️ Database Schema

### 1. Buat Tables di Supabase Dashboard

Buka **SQL Editor** di Supabase Dashboard dan jalankan script berikut:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  nim TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  faculty TEXT,
  program TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  total_borrowings INTEGER DEFAULT 0,
  active_borrowings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- 2. ITEMS TABLE
-- ============================================
CREATE TABLE public.items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image TEXT, -- emoji atau URL image dari storage
  available INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  condition TEXT CHECK (condition IN ('Baik', 'Cukup', 'Rusak')) DEFAULT 'Baik',
  location TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- 3. BORROWINGS TABLE
-- ============================================
CREATE TABLE public.borrowings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE NOT NULL,
  actual_return_date DATE,
  status TEXT CHECK (status IN ('active', 'returned', 'overdue')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- 4. CATEGORIES TABLE (Optional - untuk manage categories)
-- ============================================
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default categories
INSERT INTO public.categories (name, icon) VALUES
  ('Elektronik', 'laptop-outline'),
  ('Olahraga', 'basketball-outline'),
  ('Laboratorium', 'flask-outline'),
  ('Multimedia', 'videocam-outline'),
  ('Furniture', 'bed-outline'),
  ('Alat Tulis', 'pencil-outline');

-- ============================================
-- 5. INDEXES untuk Performance
-- ============================================
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_available ON public.items(available);
CREATE INDEX idx_borrowings_user_id ON public.borrowings(user_id);
CREATE INDEX idx_borrowings_item_id ON public.borrowings(item_id);
CREATE INDEX idx_borrowings_status ON public.borrowings(status);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================
-- 6. TRIGGERS untuk Auto Update
-- ============================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk items
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk borrowings
CREATE TRIGGER update_borrowings_updated_at
  BEFORE UPDATE ON public.borrowings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. FUNCTION untuk Auto Update User Stats
-- ============================================
CREATE OR REPLACE FUNCTION update_user_borrowing_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update active borrowings count
  UPDATE public.users
  SET active_borrowings = (
    SELECT COUNT(*)
    FROM public.borrowings
    WHERE user_id = NEW.user_id AND status = 'active'
  ),
  total_borrowings = (
    SELECT COUNT(*)
    FROM public.borrowings
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk update stats
CREATE TRIGGER update_user_stats_after_borrowing
  AFTER INSERT OR UPDATE ON public.borrowings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_borrowing_stats();

-- ============================================
-- 8. FUNCTION untuk Auto Update Item Availability
-- ============================================
CREATE OR REPLACE FUNCTION update_item_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'active' THEN
    -- Kurangi available saat borrowing active
    UPDATE public.items
    SET available = available - NEW.quantity
    WHERE id = NEW.item_id AND available >= NEW.quantity;
  ELSIF (TG_OP = 'UPDATE') AND OLD.status = 'active' AND NEW.status IN ('returned', 'overdue') THEN
    -- Kembalikan available saat item dikembalikan
    UPDATE public.items
    SET available = available + OLD.quantity
    WHERE id = OLD.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk update availability
CREATE TRIGGER update_item_stock
  AFTER INSERT OR UPDATE ON public.borrowings
  FOR EACH ROW
  EXECUTE FUNCTION update_item_availability();

-- ============================================
-- 9. FUNCTION untuk Auto Update Overdue Status
-- ============================================
CREATE OR REPLACE FUNCTION check_overdue_borrowings()
RETURNS void AS $$
BEGIN
  UPDATE public.borrowings
  SET status = 'overdue'
  WHERE status = 'active'
    AND return_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Setup cron job (perlu pg_cron extension)
-- SELECT cron.schedule('check-overdue', '0 0 * * *', 'SELECT check_overdue_borrowings()');
```

### 2. Insert Sample Data (Optional)

```sql
-- Insert sample admin user (manual - setelah register via app)
-- Password akan di-hash oleh Supabase Auth

-- Insert sample items
INSERT INTO public.items (name, category, description, image, available, total, condition, location) VALUES
  ('Laptop ASUS ROG', 'Elektronik', 'Laptop gaming ASUS ROG dengan spesifikasi tinggi untuk kebutuhan desain grafis dan programming.', '💻', 3, 5, 'Baik', 'Gedung A - Lt. 2'),
  ('Kamera Canon EOS', 'Multimedia', 'Kamera DSLR Canon EOS untuk dokumentasi acara kampus dan keperluan fotografi.', '📷', 2, 3, 'Baik', 'Gedung B - Lt. 1'),
  ('Proyektor Epson', 'Elektronik', 'Proyektor untuk presentasi dengan resolusi Full HD dan brightness tinggi.', '📽️', 5, 8, 'Baik', 'Gedung A - Lt. 1'),
  ('Bola Basket Molten', 'Olahraga', 'Bola basket official size untuk kegiatan olahraga dan turnamen.', '🏀', 8, 10, 'Baik', 'Ruang Olahraga'),
  ('Mikroskop Digital', 'Laboratorium', 'Mikroskop digital untuk praktikum biologi dan penelitian.', '🔬', 0, 4, 'Baik', 'Gedung C - Lab'),
  ('Tripod Kamera', 'Multimedia', 'Tripod professional untuk stabilitas kamera dan video recording.', '📐', 6, 6, 'Baik', 'Gedung B - Lt. 1'),
  ('Arduino Kit', 'Elektronik', 'Arduino starter kit untuk project IoT dan embedded system.', '🔌', 10, 15, 'Baik', 'Gedung C - Lab'),
  ('Papan Whiteboard', 'Furniture', 'Whiteboard portable untuk diskusi kelompok dan presentasi.', '📋', 4, 5, 'Cukup', 'Gedung A - Lt. 1');
```

---

## 🔐 Row Level Security (RLS)

### Enable RLS dan Setup Policies

```sql
-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Everyone can read their own user data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow insert on signup (via trigger)
CREATE POLICY "Allow insert during signup"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- ITEMS TABLE POLICIES
-- ============================================

-- Everyone can view items
CREATE POLICY "Anyone can view items"
  ON public.items FOR SELECT
  USING (true);

-- Only admins can insert items
CREATE POLICY "Admins can insert items"
  ON public.items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update items
CREATE POLICY "Admins can update items"
  ON public.items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete items
CREATE POLICY "Admins can delete items"
  ON public.items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- BORROWINGS TABLE POLICIES
-- ============================================

-- Users can view their own borrowings
CREATE POLICY "Users can view own borrowings"
  ON public.borrowings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all borrowings
CREATE POLICY "Admins can view all borrowings"
  ON public.borrowings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own borrowings
CREATE POLICY "Users can create borrowings"
  ON public.borrowings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any borrowing
CREATE POLICY "Admins can update borrowings"
  ON public.borrowings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🔧 Setup Supabase Client

### 1. Buat Supabase Config File

Buat file `apps/mobile/src/config/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types (auto-generated)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          nim: string;
          email: string;
          phone: string | null;
          faculty: string | null;
          program: string | null;
          role: 'admin' | 'user';
          avatar_url: string | null;
          total_borrowings: number;
          active_borrowings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          nim: string;
          email: string;
          phone?: string | null;
          faculty?: string | null;
          program?: string | null;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          total_borrowings?: number;
          active_borrowings?: number;
        };
        Update: {
          name?: string;
          nim?: string;
          email?: string;
          phone?: string | null;
          faculty?: string | null;
          program?: string | null;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          image: string | null;
          available: number;
          total: number;
          condition: 'Baik' | 'Cukup' | 'Rusak';
          location: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category: string;
          description?: string | null;
          image?: string | null;
          available: number;
          total: number;
          condition?: 'Baik' | 'Cukup' | 'Rusak';
          location: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          category?: string;
          description?: string | null;
          image?: string | null;
          available?: number;
          total?: number;
          condition?: 'Baik' | 'Cukup' | 'Rusak';
          location?: string;
        };
      };
      borrowings: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          quantity: number;
          borrow_date: string;
          return_date: string;
          actual_return_date: string | null;
          status: 'active' | 'returned' | 'overdue';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          item_id: string;
          quantity?: number;
          borrow_date?: string;
          return_date: string;
          actual_return_date?: string | null;
          status?: 'active' | 'returned' | 'overdue';
          notes?: string | null;
        };
        Update: {
          quantity?: number;
          return_date?: string;
          actual_return_date?: string | null;
          status?: 'active' | 'returned' | 'overdue';
          notes?: string | null;
        };
      };
    };
  };
};
```

### 2. Dapatkan Supabase Credentials

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Settings** (⚙️) → **API**
4. Copy:
   - **Project URL** → Ganti `SUPABASE_URL`
   - **anon public key** → Ganti `SUPABASE_ANON_KEY`

---

## 🔑 Authentication Implementation

### 1. Buat Auth Service

Buat file `apps/mobile/src/services/authService.ts`:

```typescript
import { supabase } from '../config/supabase';
import { Alert } from 'react-native';

export interface RegisterData {
  name: string;
  nim: string;
  email: string;
  phone: string;
  faculty: string;
  program: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  // Register new user
  async register(data: RegisterData) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            nim: data.nim,
          },
        },
      });

      if (authError) throw authError;

      // 2. Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: data.name,
            nim: data.nim,
            email: data.email,
            phone: data.phone,
            faculty: data.faculty,
            program: data.program,
            role: data.role || 'user',
          });

        if (profileError) throw profileError;
      }

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(data: LoginData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, user: authData.user, profile };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error: any) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return null;
    }
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<RegisterData>) {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  },

  // Change password
  async changePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  },
};
```

### 2. Update LoginScreen untuk menggunakan Supabase

```typescript
// Di LoginScreen.tsx, ganti handleLogin:
import { authService } from '../services/authService';

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Email dan password tidak boleh kosong');
    return;
  }

  const result = await authService.login({ email, password });

  if (result.success && result.profile) {
    onLogin(result.profile);
  } else {
    Alert.alert('Login Gagal', result.error || 'Terjadi kesalahan');
  }
};
```

### 3. Update RegisterScreen untuk menggunakan Supabase

```typescript
// Di RegisterScreen.tsx, ganti handleRegister di App.tsx:
const handleRegister = async (data: RegisterData) => {
  const result = await authService.register(data);

  if (result.success) {
    Alert.alert('Berhasil', 'Registrasi berhasil! Silakan login.', [
      {
        text: 'OK',
        onPress: () => setScreen('login'),
      },
    ]);
  } else {
    Alert.alert('Registrasi Gagal', result.error || 'Terjadi kesalahan');
  }
};
```

---

## 📊 CRUD Operations

### 1. Buat Items Service

Buat file `apps/mobile/src/services/itemsService.ts`:

```typescript
import { supabase } from '../config/supabase';

export interface ItemData {
  name: string;
  category: string;
  description?: string;
  image?: string;
  total: number;
  available: number;
  condition?: 'Baik' | 'Cukup' | 'Rusak';
  location: string;
}

export const itemsService = {
  // Get all items
  async getAllItems() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get items error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get item by ID
  async getItemById(id: string) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get item error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Get items by category
  async getItemsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get items by category error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Search items
  async searchItems(query: string) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Search items error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Create new item (admin only)
  async createItem(itemData: ItemData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('items')
        .insert({
          ...itemData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create item error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Update item (admin only)
  async updateItem(id: string, updates: Partial<ItemData>) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update item error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Delete item (admin only)
  async deleteItem(id: string) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete item error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get available items only
  async getAvailableItems() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .gt('available', 0)
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get available items error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },
};
```

### 2. Buat Borrowings Service

Buat file `apps/mobile/src/services/borrowingsService.ts`:

```typescript
import { supabase } from '../config/supabase';

export interface BorrowingData {
  item_id: string;
  quantity: number;
  return_date: string;
  notes?: string;
}

export const borrowingsService = {
  // Get user's borrowings
  async getUserBorrowings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select(`
          *,
          items (
            id,
            name,
            image,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get user borrowings error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get all borrowings (admin only)
  async getAllBorrowings() {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select(`
          *,
          items (
            id,
            name,
            image,
            category
          ),
          users (
            id,
            name,
            nim,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get all borrowings error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get borrowings by status
  async getBorrowingsByStatus(status: 'active' | 'returned' | 'overdue') {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select(`
          *,
          items (
            id,
            name,
            image,
            category
          ),
          users (
            id,
            name,
            nim,
            email
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get borrowings by status error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Create new borrowing
  async createBorrowing(userId: string, borrowingData: BorrowingData) {
    try {
      const { data, error } = await supabase
        .from('borrowings')
        .insert({
          user_id: userId,
          ...borrowingData,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create borrowing error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Update borrowing status (admin only)
  async updateBorrowingStatus(id: string, status: 'active' | 'returned' | 'overdue') {
    try {
      const updates: any = { status };
      
      // Set actual return date when returned
      if (status === 'returned') {
        updates.actual_return_date = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('borrowings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update borrowing status error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Get borrowing statistics
  async getBorrowingStats() {
    try {
      const { data: allData, error: allError } = await supabase
        .from('borrowings')
        .select('status');

      if (allError) throw allError;

      const stats = {
        total: allData.length,
        active: allData.filter(b => b.status === 'active').length,
        overdue: allData.filter(b => b.status === 'overdue').length,
        returned: allData.filter(b => b.status === 'returned').length,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('Get borrowing stats error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Check for overdue borrowings
  async checkOverdueBorrowings() {
    try {
      // This would typically be run by a scheduled job
      // For now, just return overdue count
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('borrowings')
        .select('id')
        .eq('status', 'active')
        .lt('return_date', today);

      if (error) throw error;
      return { success: true, data: data.length };
    } catch (error: any) {
      console.error('Check overdue error:', error);
      return { success: false, error: error.message, data: 0 };
    }
  },
};
```

---

## ⚡ Real-time Features

### Setup Real-time Subscriptions

Buat file `apps/mobile/src/hooks/useRealtimeItems.ts`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Item } from '../types';

export const useRealtimeItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    fetchItems();

    // Setup real-time subscription
    const subscription = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          console.log('Items changed:', payload);
          fetchItems(); // Refetch all items
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  return { items, loading, refetch: fetchItems };
};
```

---

## 📸 Storage untuk Images

### Setup Storage Bucket

1. Di Supabase Dashboard, buka **Storage**
2. Klik **Create a new bucket**
3. Name: `item-images`
4. Public bucket: ✅ Yes
5. Click **Create bucket**

### Upload Image Service

Buat file `apps/mobile/src/services/storageService.ts`:

```typescript
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

export const storageService = {
  // Upload item image
  async uploadItemImage(uri: string, itemId: string) {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate unique filename
      const filename = `${itemId}-${Date.now()}.jpg`;
      const filePath = `items/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Upload image error:', error);
      return { success: false, error: error.message, url: null };
    }
  },

  // Delete item image
  async deleteItemImage(url: string) {
    try {
      // Extract file path from URL
      const filePath = url.split('/item-images/')[1];

      const { error } = await supabase.storage
        .from('item-images')
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete image error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Helper function to decode base64
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
```

---

## 🎯 Implementation Checklist

### Phase 1: Setup & Authentication
- [ ] Create Supabase project
- [ ] Run database schema SQL
- [ ] Setup RLS policies
- [ ] Install dependencies
- [ ] Create supabase config
- [ ] Implement authService
- [ ] Update LoginScreen
- [ ] Update RegisterScreen
- [ ] Test authentication flow

### Phase 2: Items Management
- [ ] Implement itemsService
- [ ] Update ItemsScreen to use Supabase
- [ ] Update ManageItemsScreen to use Supabase
- [ ] Update AddItemScreen to use Supabase
- [ ] Test CRUD operations

### Phase 3: Borrowings Management
- [ ] Implement borrowingsService
- [ ] Update MyBorrowingsScreen
- [ ] Update ManageBorrowingsScreen
- [ ] Test borrowing flow

### Phase 4: Real-time & Storage
- [ ] Setup real-time subscriptions
- [ ] Implement image upload
- [ ] Test real-time updates
- [ ] Test image storage

### Phase 5: Testing & Optimization
- [ ] Test all user flows
- [ ] Test admin flows
- [ ] Optimize queries
- [ ] Add error handling
- [ ] Add loading states

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid API key"
**Solution**: Double-check your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `supabase.ts`

### Issue 2: "Row Level Security policy violation"
**Solution**: Make sure RLS policies are properly set up. Check if user is authenticated.

### Issue 3: "Cannot read property 'id' of null"
**Solution**: Ensure user is logged in before accessing `auth.uid()`. Add null checks.

### Issue 4: Real-time not working
**Solution**: Enable Realtime in Supabase Dashboard: Database → Replication → Enable for tables

### Issue 5: Image upload fails
**Solution**: Check storage bucket is public and CORS is configured correctly

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)

---

## 💡 Tips

1. **Always test RLS policies** - Use Supabase SQL editor with different user contexts
2. **Use indexes** - Add indexes on frequently queried columns
3. **Enable real-time selectively** - Only for tables that need it
4. **Optimize queries** - Use `select('column1, column2')` instead of `select('*')`
5. **Handle errors gracefully** - Always wrap Supabase calls in try-catch
6. **Use TypeScript types** - Generate types from Supabase: `npx supabase gen types typescript`
7. **Monitor usage** - Check Supabase Dashboard → Reports for usage stats

---

## 🚀 Next Steps

Setelah implementasi Supabase selesai:

1. **Deploy to Production**
   - Upgrade Supabase plan jika diperlukan
   - Setup custom domain
   - Configure production environment variables

2. **Add Advanced Features**
   - Email notifications (Supabase Edge Functions)
   - Push notifications
   - Analytics dashboard
   - Export data to Excel/PDF

3. **Security Enhancements**
   - Add rate limiting
   - Implement 2FA
   - Add audit logging

4. **Performance Optimization**
   - Add caching layer
   - Implement pagination
   - Optimize images

---

**Good luck! 🎉**

Jika ada pertanyaan atau butuh bantuan, silakan buka issue di repository atau hubungi tim development.
