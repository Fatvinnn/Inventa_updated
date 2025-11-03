import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Borrowing } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface BorrowingCardProps {
  borrowing: Borrowing;
}

const getStatusInfo = (status: Borrowing['status']) => {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Sedang Dipinjam',
        color: COLORS.primary,
        icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
        bgColor: '#EEF2FF', // Indigo 50
      };
    case 'RETURNED':
      return {
        label: 'Dikembalikan',
        color: COLORS.success,
        icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
        bgColor: '#DCFCE7', // Green 100
      };
    case 'OVERDUE':
      return {
        label: 'Terlambat',
        color: COLORS.error,
        icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
        bgColor: '#FEE2E2', // Red 100
      };
    case 'PENDING':
      return {
        label: 'Menunggu Persetujuan',
        color: COLORS.warning,
        icon: 'hourglass-outline' as keyof typeof Ionicons.glyphMap,
        bgColor: '#FEF3C7', // Yellow 100
      };
    case 'REJECTED':
      return {
        label: 'Ditolak',
        color: COLORS.error,
        icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
        bgColor: '#FEE2E2', // Red 100
      };
    default:
      return {
        label: status,
        color: COLORS.gray,
        icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
        bgColor: COLORS.lightGray,
      };
  }
};

export const BorrowingCard: React.FC<BorrowingCardProps> = ({ borrowing }) => {
  const statusInfo = getStatusInfo(borrowing.status);
  const itemName = borrowing.item?.name || 'Item';

  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: statusInfo.color }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.itemName}>{itemName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>Pinjam:</Text>
            <Text style={styles.infoValue}>
              {new Date(borrowing.borrowDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>Kembali:</Text>
            <Text style={styles.infoValue}>
              {new Date(borrowing.returnDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons name="layers-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Jumlah:</Text>
            <Text style={[styles.infoValue, styles.quantityText]}>
              {borrowing.quantity} unit
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBar: {
    height: 4,
  },
  content: {
    padding: SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SIZES.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  quantityText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
});
