/**
 * Receipt Card Component
 * Displays receipt information in a card format
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Receipt, Currency } from '../types';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
  style?: any;
}

/**
 * ReceiptCard Component
 * 
 * Displays receipt information in a clean card format
 * Shows merchant, date, total, and receipt image thumbnail
 */
export default function ReceiptCard({ receipt, onPress, style }: ReceiptCardProps) {
  /**
   * Format currency amount for display
   */
  const formatAmount = (amount: number | null, currency: Currency): string => {
    if (amount === null) return 'N/A';
    
    const currencySymbols = {
      USD: '$',
      CAD: 'C$',
      EUR: '€',
      GBP: '£',
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  /**
   * Get merchant category color
   */
  const getCategoryColor = (merchant: string): string => {
    // Simple categorization based on merchant name
    const lowerMerchant = merchant.toLowerCase();
    
    if (lowerMerchant.includes('grocery') || lowerMerchant.includes('market')) {
      return colors.groceries;
    }
    if (lowerMerchant.includes('restaurant') || lowerMerchant.includes('cafe')) {
      return colors.food;
    }
    if (lowerMerchant.includes('gas') || lowerMerchant.includes('fuel')) {
      return colors.transportation;
    }
    
    return colors.other;
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.merchantInfo}>
              <Text variant="titleMedium" style={styles.merchant}>
                {receipt.merchant}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(receipt.purchaseDate)}
              </Text>
            </View>
            
            {receipt.imageUrl && (
              <Image 
                source={{ uri: receipt.imageUrl }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
            )}
          </View>
          
          <View style={styles.footer}>
            <View style={styles.amountContainer}>
              <Text variant="titleLarge" style={styles.total}>
                {formatAmount(receipt.total, receipt.currency)}
              </Text>
              {receipt.tax && receipt.tax > 0 && (
                <Text variant="bodySmall" style={styles.tax}>
                  Tax: {formatAmount(receipt.tax, receipt.currency)}
                </Text>
              )}
            </View>
            
            <View style={styles.statusContainer}>
              <Chip
                mode="outlined"
                style={[
                  styles.categoryChip,
                  { borderColor: getCategoryColor(receipt.merchant) }
                ]}
                textStyle={{ color: getCategoryColor(receipt.merchant) }}
              >
                {receipt.category || 'Other'}
              </Chip>
            </View>
          </View>
          
          {receipt.notes && (
            <Text variant="bodySmall" style={styles.notes} numberOfLines={2}>
              {receipt.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  merchantInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  merchant: {
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  date: {
    color: colors.onSurfaceVariant,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceVariant,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  amountContainer: {
    flex: 1,
  },
  total: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  tax: {
    color: colors.onSurfaceVariant,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  categoryChip: {
    backgroundColor: 'transparent',
  },
  notes: {
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

