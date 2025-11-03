import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ItemCard, SearchBar, CategoryFilter } from '../components';
import { RootStackParamList, Item } from '../types';
import { COLORS, SIZES, CATEGORIES } from '../constants/theme';
import { itemService, handleApiError } from '../services';

type ItemsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export const ItemsScreen: React.FC<ItemsScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [searchQuery, selectedCategory]);

  const fetchItems = async () => {
    try {
      setError(null);
      const filters: any = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (selectedCategory && selectedCategory !== 'Semua') {
        filters.category = selectedCategory;
      }

      const response = await itemService.getItems(filters);
      setItems(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchItems();
  };

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
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyText}>Barang tidak ditemukan</Text>
        <Text style={styles.emptySubtext}>Coba gunakan kata kunci lain</Text>
      </View>
    );
  };

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
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { item })}
          />
        )}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
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
  list: {
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 2,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: 16,
    color: COLORS.textSecondary,
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
