/**
 * Scan Button Component
 * Floating action button for initiating receipt scans
 */

import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import { FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, shadows } from '../constants/theme';

interface ScanButtonProps {
  onPress: () => void;
  loading?: boolean;
  style?: any;
}

/**
 * ScanButton Component
 * 
 * Floating action button for scanning receipts
 * Positioned at bottom right of screen with scan icon
 */
export default function ScanButton({ onPress, loading = false, style }: ScanButtonProps) {
  return (
    <FAB
      icon={({ size, color }) => (
        <Ionicons 
          name={loading ? "hourglass-outline" : "camera-outline"} 
          size={size} 
          color={color} 
        />
      )}
      onPress={onPress}
      loading={loading}
      disabled={loading}
      style={[styles.fab, style]}
      color={colors.onPrimary}
      customSize={64}
      mode="elevated"
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
});

