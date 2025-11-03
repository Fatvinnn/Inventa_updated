import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorrowingCard } from '../components';
import { borrowingService } from '../services';
import { COLORS, SIZES } from '../constants/theme';
import { Borrowing } from '../types';

export const ManageBorrowingsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'OVERDUE' | 'RETURNED'>('all');
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBorrowings = async () => {
    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const response = await borrowingService.getBorrowings(filters);
      setBorrowings(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat data peminjaman');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [filter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBorrowings();
  };

  const handleApprove = async (borrowingId: string) => {
    try {
      await borrowingService.approveBorrowing(borrowingId);
      Alert.alert('Berhasil', 'Peminjaman telah disetujui');
      fetchBorrowings();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menyetujui peminjaman');
    }
  };

  const handleReject = async (borrowingId: string) => {
    try {
      await borrowingService.rejectBorrowing(borrowingId);
      Alert.alert('Berhasil', 'Peminjaman telah ditolak');
      fetchBorrowings();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menolak peminjaman');
    }
  };

  const handleReturn = async (borrowingId: string) => {
    try {
      await borrowingService.returnBorrowing(borrowingId);
      Alert.alert('Berhasil', 'Pengembalian telah dikonfirmasi');
      fetchBorrowings();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengkonfirmasi pengembalian');
    }
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    if (filter === 'all') return true;
    return borrowing.status === filter;
  });

  const stats = {
    all: borrowings.length,
    pending: borrowings.filter(b => b.status === 'PENDING').length,
    approved: borrowings.filter(b => b.status === 'APPROVED').length,
    overdue: borrowings.filter(b => b.status === 'OVERDUE').length,
    returned: borrowings.filter(b => b.status === 'RETURNED').length,
  };

  const renderBorrowingItem = ({ item }: { item: Borrowing }) => (
    <View style={styles.borrowingWrapper}>
      <BorrowingCard borrowing={item} />
      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleApprove(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Setujui</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleReject(item.id)}
          >
            <Ionicons name="close-circle-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'APPROVED' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.returnBtn]}
            onPress={() => handleReturn(item.id)}
          >
            <Ionicons name="checkmark-done-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Konfirmasi Pengembalian</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'OVERDUE' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.reminderBtn]}
            onPress={() => handleReturn(item.id)}
          >
            <Ionicons name="checkmark-done-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Konfirmasi Pengembalian</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Semua ({stats.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'PENDING' && styles.filterTabActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
            Pending ({stats.pending})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'APPROVED' && styles.filterTabActive]}
          onPress={() => setFilter('APPROVED')}
        >
          <Text style={[styles.filterText, filter === 'APPROVED' && styles.filterTextActive]}>
            Aktif ({stats.approved})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'OVERDUE' && styles.filterTabActive]}
          onPress={() => setFilter('OVERDUE')}
        >
          <Text style={[styles.filterText, filter === 'OVERDUE' && styles.filterTextActive]}>
            Terlambat ({stats.overdue})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Borrowings List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBorrowings}
          renderItem={renderBorrowingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>Tidak ada peminjaman</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.xs,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.lg,
  },
  borrowingWrapper: {
    marginBottom: SIZES.sm,
  },
  actions: {
    paddingHorizontal: SIZES.md + SIZES.md,
    marginTop: -SIZES.sm,
    marginBottom: SIZES.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusSm,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: COLORS.success,
    flex: 1,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
    flex: 1,
  },
  returnBtn: {
    backgroundColor: COLORS.primary,
  },
  reminderBtn: {
    backgroundColor: COLORS.warning,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SIZES.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
  },
});
