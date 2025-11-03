import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ItemCard } from '../components';
import { RootStackParamList, Item } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { itemService, statsService, handleApiError } from '../services';
import type { Stats } from '../services';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [popularItems, setPopularItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsData, popularItemsData] = await Promise.all([
        statsService.getStats(),
        itemService.getPopularItems(4),
      ]);
      setStats(statsData);
      setPopularItems(popularItemsData);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.greeting}>Selamat Datang! 👋</Text>
            <Text style={styles.subtitle}>Sistem Peminjaman Barang Kampus</Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{stats?.totalItems || 0}</Text>
            <Text style={styles.statLabel}>Total Barang</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statNumber}>{stats?.availableItems || 0}</Text>
            <Text style={styles.statLabel}>Tersedia</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statNumber}>{stats?.activeBorrowings || 0}</Text>
            <Text style={styles.statLabel}>Dipinjam</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu Cepat</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Items' } as any)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Ionicons name="search-outline" size={28} color={COLORS.white} />
                <Text style={styles.actionText}>Cari Barang</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('MainTabs', { screen: 'MyBorrowings' } as any)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Ionicons name="list-outline" size={28} color={COLORS.white} />
                <Text style={styles.actionText}>Peminjaman</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Barang Populer</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Items' } as any)}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          {popularItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Belum ada barang</Text>
            </View>
          ) : (
            popularItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('ItemDetail', { item })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    padding: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    marginTop: SIZES.sm,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginTop: -40,
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: SIZES.md,
  },
  actionCard: {
    flex: 1,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    padding: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionText: {
    marginTop: SIZES.sm,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  errorText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    paddingHorizontal: SIZES.md,
  },
  emptyText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
