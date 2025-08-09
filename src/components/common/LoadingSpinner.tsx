/**
 * Loading Spinner Component
 * Reusable loading indicator with customizable size and color
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, spacing } from '../../constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  style?: any;
}

/**
 * LoadingSpinner Component
 * 
 * Displays an activity indicator with optional message
 * Used throughout the app for loading states
 */
export default function LoadingSpinner({ 
  size = 'large', 
  color = colors.primary,
  message,
  style 
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message} variant="bodyMedium">
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
});

