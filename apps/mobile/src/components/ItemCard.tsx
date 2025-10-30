import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Item } from '../types';
import { COLORS, SIZES } from '../constants/theme';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Elektronik': 'laptop-outline',
    'Olahraga': 'basketball-outline',
    'Laboratorium': 'flask-outline',
    'Multimedia': 'videocam-outline',
    'Furniture': 'bed-outline',
    'Alat Tulis': 'pencil-outline',
  };
  return icons[category] || 'cube-outline';
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  const hasAvailable = item.available > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <LinearGradient
          colors={hasAvailable ? [COLORS.primary, COLORS.primaryDark] : [COLORS.gray, COLORS.darkGray]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name={getCategoryIcon(item.category)} size={32} color={COLORS.white} />
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.statusBadge, hasAvailable ? styles.availableBadge : styles.unavailableBadge]}>
              <View style={[styles.statusDot, hasAvailable && styles.availableDot]} />
              <Text style={[styles.statusText, hasAvailable && styles.availableText]}>
                {hasAvailable ? `${item.available} Tersedia` : 'Habis'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.category}>{item.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.quantityContainer}>
              <Ionicons name="layers-outline" size={16} color={COLORS.primary} />
              <Text style={styles.quantity}>
                Total: {item.total} unit
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SIZES.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  availableBadge: {
    backgroundColor: '#DCFCE7', // Green 100
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2', // Red 100
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray,
    marginRight: 4,
  },
  availableDot: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },
  availableText: {
    color: COLORS.success,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
});
