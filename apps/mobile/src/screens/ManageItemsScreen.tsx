import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemCard, SearchBar, CategoryFilter } from '../components';
import { itemService } from '../services';
import { CATEGORIES, COLORS, SIZES } from '../constants/theme';
import { Item } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ManageItemsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editedTotal, setEditedTotal] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const filters = {
        search: searchQuery || undefined,
        category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      };
      const response = await itemService.getItems(filters);
      setItems(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat data barang');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, selectedCategory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchItems();
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setEditedTotal(item.quantity.toString());
    setEditModalVisible(true);
  };

  const handleDeleteItem = (item: Item) => {
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const confirmEdit = async () => {
    if (!selectedItem) return;
    
    const newTotal = parseInt(editedTotal);
    if (isNaN(newTotal) || newTotal < 0) {
      Alert.alert('Error', 'Total unit harus berupa angka positif');
      return;
    }

    try {
      await itemService.updateItem(selectedItem.id, { quantity: newTotal });
      Alert.alert('Berhasil', `Total unit ${selectedItem.name} berhasil diubah menjadi ${newTotal}`);
      setEditModalVisible(false);
      setSelectedItem(null);
      fetchItems(); // Refresh list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengupdate barang');
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await itemService.deleteItem(selectedItem.id);
      Alert.alert('Berhasil', `${selectedItem.name} berhasil dihapus`);
      setDeleteModalVisible(false);
      setSelectedItem(null);
      fetchItems(); // Refresh list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menghapus barang');
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemWrapper}>
      <TouchableOpacity 
        onPress={() => handleEditItem(item)}
        activeOpacity={0.9}
      >
        <ItemCard
          item={item}
          onPress={() => handleEditItem(item)}
        />
      </TouchableOpacity>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditItem(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteItem(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Cari barang..."
      />
      
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <View style={styles.header}>
        <Text style={styles.resultText}>
          {filteredItems.length} Barang ditemukan
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddItem')}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>Tidak ada barang ditemukan</Text>
            </View>
          }
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Barang</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.itemName}>{selectedItem?.name}</Text>
              <Text style={styles.itemCategory}>{selectedItem?.category}</Text>

              <View style={styles.divider} />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Unit</Text>
                <TextInput
                  style={styles.input}
                  value={editedTotal}
                  onChangeText={setEditedTotal}
                  keyboardType="numeric"
                  placeholder="Masukkan jumlah unit"
                  placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.helperText}>
                  Unit tersedia saat ini: {selectedItem?.availableQuantity}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmEdit}
              >
                <Text style={styles.confirmButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color={COLORS.error} />
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.deleteTitle}>Hapus Barang?</Text>
              <Text style={styles.deleteMessage}>
                Apakah Anda yakin ingin menghapus{'\n'}
                <Text style={styles.deleteItemName}>{selectedItem?.name}</Text>?{'\n'}
                Tindakan ini tidak dapat dibatalkan.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  resultText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: SIZES.lg,
  },
  itemWrapper: {
    marginBottom: SIZES.md,
  },
  itemActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md + SIZES.md,
    marginTop: -SIZES.sm,
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusSm,
    gap: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: SIZES.lg,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  itemCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.md,
  },
  inputGroup: {
    marginTop: SIZES.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.lg,
    gap: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  deleteMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteItemName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  deleteConfirmButton: {
    backgroundColor: COLORS.error,
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
