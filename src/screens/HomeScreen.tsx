/**
 * Home Screen Component
 * Main screen displaying receipts with merchant filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Menu, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useReceipts } from '../contexts/ReceiptContext';
import ReceiptCard from '../components/ReceiptCard';
import MerchantTabs from '../components/MerchantTabs';
import ScanButton from '../components/ScanButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Receipt } from '../types';
import { colors, spacing } from '../constants/theme';
import type { HomeScreenProps } from '../navigation/types';

/**
 * HomeScreen Component
 * 
 * Displays list of receipts with filtering and search capabilities
 * Includes merchant tabs, search bar, and pull-to-refresh
 */
export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { 
    receipts, 
    loading, 
    error, 
    merchants, 
    refreshReceipts, 
    clearError,
    getReceiptsByMerchant 
  } = useReceipts();

  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date');

  /**
   * Filter and sort receipts based on current filters
   */
  const filterAndSortReceipts = useCallback(() => {
    let filtered = selectedMerchant 
      ? getReceiptsByMerchant(selectedMerchant)
      : receipts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.merchant.toLowerCase().includes(query) ||
        receipt.notes?.toLowerCase().includes(query) ||
        receipt.total?.toString().includes(query)
      );
    }

    // Sort receipts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.purchaseDate || a.createdAt);
          const dateB = new Date(b.purchaseDate || b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Newest first
        
        case 'amount':
          const amountA = a.total || 0;
          const amountB = b.total || 0;
          return amountB - amountA; // Highest first
        
        case 'merchant':
          return a.merchant.localeCompare(b.merchant);
        
        default:
          return 0;
      }
    });

    setFilteredReceipts(filtered);
  }, [receipts, selectedMerchant, searchQuery, sortBy, getReceiptsByMerchant]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshReceipts();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle receipt card press
   */
  const handleReceiptPress = (receipt: Receipt) => {
    navigation.navigate('ReceiptDetail', { receiptId: receipt.id });
  };

  /**
   * Handle scan button press
   */
  const handleScanPress = () => {
    navigation.navigate('Scan');
  };

  /**
   * Handle merchant tab selection
   */
  const handleMerchantSelect = (merchant: string | null) => {
    setSelectedMerchant(merchant);
  };

  /**
   * Handle sort option selection
   */
  const handleSortSelect = (option: 'date' | 'amount' | 'merchant') => {
    setSortBy(option);
    setSortMenuVisible(false);
  };

  /**
   * Render receipt item
   */
  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <ReceiptCard
      receipt={item}
      onPress={() => handleReceiptPress(item)}
    />
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No receipts found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        {selectedMerchant 
          ? `No receipts found for ${selectedMerchant}`
          : searchQuery.trim()
          ? 'No receipts match your search'
          : 'Start by scanning your first receipt'
        }
      </Text>
      {!selectedMerchant && !searchQuery.trim() && (
        <Button
          mode="contained"
          onPress={handleScanPress}
          style={styles.scanButton}
          icon="camera"
        >
          Scan Receipt
        </Button>
      )}
    </View>
  );

  /**
   * Update filtered receipts when dependencies change
   */
  useEffect(() => {
    filterAndSortReceipts();
  }, [filterAndSortReceipts]);

  if (loading && receipts.length === 0) {
    return <LoadingSpinner message="Loading receipts..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          clearError();
          refreshReceipts();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Sort Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search receipts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
        
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setSortMenuVisible(true)}
              icon="sort"
              style={styles.sortButton}
            >
              Sort
            </Button>
          }
        >
          <Menu.Item
            onPress={() => handleSortSelect('date')}
            title="Date"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSortSelect('amount')}
            title="Amount"
            leadingIcon={sortBy === 'amount' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSortSelect('merchant')}
            title="Merchant"
            leadingIcon={sortBy === 'merchant' ? 'check' : undefined}
          />
        </Menu>
      </View>

      {/* Merchant Tabs */}
      {merchants.length > 0 && (
        <MerchantTabs
          merchants={merchants}
          selectedMerchant={selectedMerchant}
          onMerchantSelect={handleMerchantSelect}
        />
      )}

      {/* Receipt List */}
      <FlatList
        data={filteredReceipts}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredReceipts.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Scan Button */}
      <ScanButton onPress={handleScanPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchbar: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  sortButton: {
    borderColor: colors.outline,
  },
  listContent: {
    paddingBottom: 100, // Space for FAB
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.onSurface,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  scanButton: {
    marginTop: spacing.md,
  },
});

