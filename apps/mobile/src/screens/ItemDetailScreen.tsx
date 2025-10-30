import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SIZES } from '../constants/theme';

type ItemDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ItemDetail'>;

export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState('1');

  const handleBorrow = () => {
    if (item.available === 0) {
      Alert.alert('Tidak Tersedia', 'Maaf, barang ini sedang tidak tersedia.');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Invalid', 'Jumlah harus minimal 1');
      return;
    }

    if (qty > item.available) {
      Alert.alert('Invalid', `Hanya tersedia ${item.available} unit`);
      return;
    }

    Alert.alert(
      'Konfirmasi Peminjaman',
      `Pinjam ${qty} unit ${item.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Pinjam',
          onPress: () => {
            Alert.alert('Berhasil!', 'Peminjaman berhasil diajukan. Silakan ambil barang di lokasi yang tertera.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getConditionColor = () => {
    switch (item.condition) {
      case 'Baik':
        return COLORS.success;
      case 'Cukup':
        return COLORS.warning;
      case 'Rusak':
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Text style={styles.emoji}>{item.image}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <View style={[styles.conditionBadge, { backgroundColor: getConditionColor() }]}>
              <Text style={styles.conditionText}>{item.condition}</Text>
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ketersediaan</Text>
            <View style={styles.availabilityContainer}>
              <View style={styles.availabilityItem}>
                <Text style={styles.availabilityNumber}>{item.available}</Text>
                <Text style={styles.availabilityLabel}>Tersedia</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.availabilityItem}>
                <Text style={styles.availabilityNumber}>{item.total - item.available}</Text>
                <Text style={styles.availabilityLabel}>Dipinjam</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.availabilityItem}>
                <Text style={styles.availabilityNumber}>{item.total}</Text>
                <Text style={styles.availabilityLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lokasi</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>

          {/* Quantity Input */}
          {item.available > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Jumlah Pinjam</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(String(Math.max(1, parseInt(quantity) - 1)))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(String(Math.min(item.available, parseInt(quantity) + 1)))}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.maxQuantity}>Maksimal: {item.available} unit</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.borrowButton, item.available === 0 && styles.borrowButtonDisabled]}
          onPress={handleBorrow}
          disabled={item.available === 0}
        >
          <Text style={styles.borrowButtonText}>
            {item.available === 0 ? 'Tidak Tersedia' : 'Ajukan Peminjaman'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: 250,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 120,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.lg,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  category: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  conditionBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 8,
  },
  conditionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  availabilityContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  availabilityItem: {
    alignItems: 'center',
    flex: 1,
  },
  availabilityNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  availabilityLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: 12,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: SIZES.md,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.md,
  },
  quantityButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 80,
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  maxQuantity: {
    textAlign: 'center',
    marginTop: SIZES.sm,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  bottomContainer: {
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  borrowButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  borrowButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  borrowButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
