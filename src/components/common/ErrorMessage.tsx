/**
 * Error Message Component
 * Displays error messages with retry functionality
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius } from '../../constants/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  style?: any;
}

/**
 * ErrorMessage Component
 * 
 * Displays error messages in a consistent format
 * Optionally includes a retry button
 */
export default function ErrorMessage({ 
  message, 
  onRetry, 
  retryText = 'Try Again',
  style 
}: ErrorMessageProps) {
  return (
    <Card style={[styles.container, style]}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={48} 
            color={colors.error} 
          />
        </View>
        
        <Text style={styles.message} variant="bodyLarge">
          {message}
        </Text>
        
        {onRetry && (
          <Button
            mode="contained"
            onPress={onRetry}
            style={styles.retryButton}
            buttonColor={colors.error}
          >
            {retryText}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
    backgroundColor: colors.errorContainer,
  },
  content: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  message: {
    textAlign: 'center',
    color: colors.onErrorContainer,
    marginBottom: spacing.lg,
  },
  retryButton: {
    borderRadius: borderRadius.lg,
  },
});

