/**
 * Merchant Tabs Component
 * Dynamic tabs for filtering receipts by merchant
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { colors, spacing, borderRadius } from '../constants/theme';

interface MerchantTabsProps {
  merchants: string[];
  selectedMerchant: string | null;
  onMerchantSelect: (merchant: string | null) => void;
  style?: any;
}

/**
 * MerchantTabs Component
 * 
 * Displays horizontal scrollable tabs for merchant filtering
 * Includes "All" tab and dynamic merchant tabs based on receipt data
 */
export default function MerchantTabs({ 
  merchants, 
  selectedMerchant, 
  onMerchantSelect,
  style 
}: MerchantTabsProps) {
  /**
   * Handle tab selection
   */
  const handleTabPress = useCallback((merchant: string | null) => {
    onMerchantSelect(merchant);
  }, [onMerchantSelect]);

  /**
   * Check if tab is selected
   */
  const isSelected = useCallback((merchant: string | null) => {
    return selectedMerchant === merchant;
  }, [selectedMerchant]);

  if (merchants.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text variant="bodyMedium" style={styles.emptyText}>
          No merchants found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All tab */}
        <Chip
          mode={isSelected(null) ? 'flat' : 'outlined'}
          selected={isSelected(null)}
          onPress={() => handleTabPress(null)}
          style={[
            styles.tab,
            isSelected(null) && styles.selectedTab
          ]}
          textStyle={[
            styles.tabText,
            isSelected(null) && styles.selectedTabText
          ]}
        >
          All
        </Chip>
        
        {/* Dynamic merchant tabs */}
        {merchants.map((merchant) => (
          <Chip
            key={merchant}
            mode={isSelected(merchant) ? 'flat' : 'outlined'}
            selected={isSelected(merchant)}
            onPress={() => handleTabPress(merchant)}
            style={[
              styles.tab,
              isSelected(merchant) && styles.selectedTab
            ]}
            textStyle={[
              styles.tabText,
              isSelected(merchant) && styles.selectedTabText
            ]}
          >
            {merchant}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderColor: colors.outline,
  },
  selectedTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTabText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    padding: spacing.md,
  },
});

