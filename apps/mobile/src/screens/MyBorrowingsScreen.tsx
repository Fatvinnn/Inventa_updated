import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { BorrowingCard } from '../components';
import { Borrowing } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { borrowingService, handleApiError } from '../services';

type FilterType = 'all' | 'PENDING' | 'APPROVED' | 'RETURNED' | 'REJECTED';

export const MyBorrowingsScreen: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBorrowings();
  }, [filter]);

  const fetchBorrowings = async () => {
    try {
      setError(null);
      const filters: any = {};
      
      if (filter !== 'all') {
        filters.status = filter;
      }

      const response = await borrowingService.getMyBorrowings(filters);
      setBorrowings(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBorrowings();
  };

  const handleCancelBorrowing = async (borrowingId: string, itemName: string) => {
    Alert.alert(
      'Batalkan Peminjaman',
      `Apakah Anda yakin ingin membatalkan peminjaman "${itemName}"?`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            try {
              await borrowingService.cancelBorrowing(borrowingId);
              Alert.alert('Berhasil', 'Peminjaman berhasil dibatalkan');
              fetchBorrowings();
            } catch (err) {
              Alert.alert('Error', handleApiError(err));
            }
          },
        },
      ]
    );
  };

  const activeBorrowings = borrowings.filter(b => b.status === 'APPROVED').length;
  const pendingBorrowings = borrowings.filter(b => b.status === 'PENDING').length;

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>Gagal memuat data</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>Belum ada peminjaman</Text>
        <Text style={styles.emptySubtext}>Pinjam barang untuk memulai</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Semua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'PENDING' && styles.filterButtonActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'APPROVED' && styles.filterButtonActive]}
          onPress={() => setFilter('APPROVED')}
        >
          <Text style={[styles.filterText, filter === 'APPROVED' && styles.filterTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'RETURNED' && styles.filterButtonActive]}
          onPress={() => setFilter('RETURNED')}
        >
          <Text style={[styles.filterText, filter === 'RETURNED' && styles.filterTextActive]}>
            Selesai
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={borrowings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <BorrowingCard borrowing={item} />
            {item.status === 'PENDING' && (
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelBorrowing(item.id, item.item?.name || 'Item')}
                >
                  <Text style={styles.cancelButtonText}>Batalkan Peminjaman</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={borrowings.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.md,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  list: {
    paddingBottom: SIZES.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionContainer: {
    paddingHorizontal: SIZES.md + SIZES.md,
    marginTop: -SIZES.sm,
    marginBottom: SIZES.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
