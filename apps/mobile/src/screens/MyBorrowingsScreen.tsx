import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { BorrowingCard } from '../components';
import { MOCK_BORROWINGS } from '../data/mockData';
import { Borrowing } from '../types';
import { COLORS, SIZES } from '../constants/theme';

export const MyBorrowingsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all');

  const filteredBorrowings = MOCK_BORROWINGS.filter((borrowing) => {
    if (filter === 'all') return true;
    return borrowing.status === filter;
  });

  const activeBorrowings = MOCK_BORROWINGS.filter(b => b.status === 'active').length;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>Belum ada peminjaman</Text>
      <Text style={styles.emptySubtext}>Pinjam barang untuk memulai</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeBorrowings}</Text>
          <Text style={styles.statLabel}>Sedang Dipinjam</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{MOCK_BORROWINGS.length}</Text>
          <Text style={styles.statLabel}>Total Peminjaman</Text>
        </View>
      </View>

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
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'returned' && styles.filterButtonActive]}
          onPress={() => setFilter('returned')}
        >
          <Text style={[styles.filterText, filter === 'returned' && styles.filterTextActive]}>
            Selesai
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredBorrowings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BorrowingCard borrowing={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
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
    gap: SIZES.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
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
});
