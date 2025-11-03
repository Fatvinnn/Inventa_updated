import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { statsService, Activity } from '../services';
import { RootStackParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

type AdminDashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

interface AdminStats {
  totalItems: number;
  totalStock: number;
  availableStock: number;
  borrowedStock: number;
  activeBorrowings: number;
  overdueBorrowings: number;
}

export const AdminDashboardScreen: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalItems: 0,
    totalStock: 0,
    availableStock: 0,
    borrowedStock: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        statsService.getStats(),
        statsService.getActivities(10),
      ]);

      setStats({
        totalItems: statsData.totalItems,
        totalStock: statsData.totalItems,
        availableStock: statsData.availableItems,
        borrowedStock: statsData.borrowedItems,
        activeBorrowings: statsData.activeBorrowings,
        overdueBorrowings: statsData.overdueItems || 0,
      });

      setActivities(activitiesData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const quickActions = [
    { 
      id: 1, 
      title: 'Tambah Barang', 
      icon: 'add-circle-outline', 
      colors: [COLORS.primary, COLORS.primaryDark] as const,
      onPress: () => navigation.navigate('AddItem')
    },
    { 
      id: 2, 
      title: 'Kelola Barang', 
      icon: 'cube-outline', 
      colors: ['#8B5CF6', '#7C3AED'] as const,
      onPress: () => navigation.navigate('MainTabs', { screen: 'ManageItems' } as any)
    },
    { 
      id: 3, 
      title: 'Verifikasi Pinjam', 
      icon: 'checkmark-circle-outline', 
      colors: ['#10B981', '#059669'] as const,
      onPress: () => navigation.navigate('MainTabs', { screen: 'ManageBorrowings' } as any)
    },
  ];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
        >
        {/* Hero Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.white} />
            <Text style={styles.greeting}>Dashboard Admin</Text>
            <Text style={styles.subtitle}>Kelola sistem peminjaman barang</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>{stats.totalItems}</Text>
              <Text style={styles.statLabel}>Jenis Barang</Text>
            </View>

            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="layers-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statNumber}>{stats.totalStock}</Text>
              <Text style={styles.statLabel}>Total Stok</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statNumber}>{stats.availableStock}</Text>
              <Text style={styles.statLabel}>Tersedia</Text>
            </View>

            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time-outline" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statNumber}>{stats.borrowedStock}</Text>
              <Text style={styles.statLabel}>Dipinjam</Text>
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="list-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statNumber}>{stats.activeBorrowings}</Text>
              <Text style={styles.statLabel}>Peminjaman Aktif</Text>
            </View>

            <View style={[styles.statCard, styles.statCardSmall]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
              </View>
              <Text style={styles.statNumber}>{stats.overdueBorrowings}</Text>
              <Text style={styles.statLabel}>Terlambat</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu Cepat</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={action.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={32} color={COLORS.white} />
                  <Text style={styles.actionText}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          </View>
          <View style={styles.activitiesContainer}>
            {activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Belum ada aktivitas terbaru</Text>
              </View>
            ) : (
              activities.slice(0, 5).map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={[
                    styles.activityDot, 
                    { backgroundColor: COLORS.primary }
                  ]} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.itemName || activity.userName}</Text>
                    <Text style={styles.activitySubtitle}>{activity.description}</Text>
                  </View>
                  <Text style={styles.activityDate}>
                    {new Date(activity.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      )}
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
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsGrid: {
    paddingHorizontal: SIZES.md,
    marginTop: -40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardSmall: {
    flex: 1,
    alignItems: 'center',
  },
  statCardLarge: {
    flex: 1,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.sm,
    marginBottom: 4,
    textAlign: 'center',
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  actionCard: {
    width: '48.5%',
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
    minHeight: 100,
  },
  actionText: {
    marginTop: SIZES.sm,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  activitiesContainer: {
    paddingHorizontal: SIZES.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SIZES.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
