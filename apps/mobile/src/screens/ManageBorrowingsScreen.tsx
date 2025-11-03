import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorrowingCard } from '../components';
import { MOCK_BORROWINGS } from '../data/mockData';
import { COLORS, SIZES } from '../constants/theme';
import { Borrowing } from '../types';

export const ManageBorrowingsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');

  const filteredBorrowings = MOCK_BORROWINGS.filter(borrowing => {
    if (filter === 'all') return true;
    return borrowing.status === filter;
  });

  const stats = {
    all: MOCK_BORROWINGS.length,
    active: MOCK_BORROWINGS.filter(b => b.status === 'active').length,
    overdue: MOCK_BORROWINGS.filter(b => b.status === 'overdue').length,
    returned: MOCK_BORROWINGS.filter(b => b.status === 'returned').length,
  };

  const renderBorrowingItem = ({ item }: { item: Borrowing }) => (
    <View style={styles.borrowingWrapper}>
      <BorrowingCard borrowing={item} />
      {item.status === 'active' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Setujui Pengembalian</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'overdue' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.reminderBtn]}>
            <Ionicons name="notifications-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Kirim Pengingat</Text>
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
            Semua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'overdue' && styles.filterTabActive]}
          onPress={() => setFilter('overdue')}
        >
          <Text style={[styles.filterText, filter === 'overdue' && styles.filterTextActive]}>
            Terlambat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'returned' && styles.filterTabActive]}
          onPress={() => setFilter('returned')}
        >
          <Text style={[styles.filterText, filter === 'returned' && styles.filterTextActive]}>
            Kembali
          </Text>
        </TouchableOpacity>
      </View>

      {/* Borrowings List */}
      <FlatList
        data={filteredBorrowings}
        renderItem={renderBorrowingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>Tidak ada peminjaman</Text>
          </View>
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
  },
  reminderBtn: {
    backgroundColor: COLORS.warning,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
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
