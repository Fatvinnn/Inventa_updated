import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../contexts';
import { statsService, handleApiError } from '../services';

export const ProfileScreen: React.FC = () => {
  const route = useRoute();
  const { onLogout } = (route.params as any) || {};
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const stats = await statsService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={COLORS.white} />
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </LinearGradient>

        {/* Stats Cards */}
        {isLoading ? (
          <View style={styles.statsContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{userStats?.totalBorrowings || 0}</Text>
              <Text style={styles.statLabel}>Total Pinjaman</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{userStats?.activeBorrowings || 0}</Text>
              <Text style={styles.statLabel}>Sedang Dipinjam</Text>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
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
  header: {
    alignItems: 'center',
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.md,
    marginTop: -30,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.sm,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.md,
    marginTop: SIZES.lg,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SIZES.md,
    marginTop: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SIZES.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  version: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
