/**
 * Forgot Password Screen Component
 * Handles password reset functionality
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors, spacing, borderRadius } from '../constants/theme';
import { SUCCESS_MESSAGES } from '../constants';
import type { ForgotPasswordScreenProps } from '../navigation/types';

/**
 * ForgotPasswordScreen Component
 * 
 * Provides password reset interface
 * Sends password reset email to user
 */
export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Handle password reset form submission
   */
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError('');
      await resetPassword(email.trim());
      setSuccess(SUCCESS_MESSAGES.PASSWORD_RESET);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    }
  };

  /**
   * Navigate back to login screen
   */
  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (loading) {
    return <LoadingSpinner message="Sending reset email..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              Reset Password
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                error={!!error && (!email.trim() || !email.includes('@'))}
              />

              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.resetButton}
                contentStyle={styles.buttonContent}
              >
                Send Reset Email
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Remember your password?
            </Text>
            <Button
              mode="text"
              onPress={handleBackToLogin}
              style={styles.loginButton}
            >
              Back to Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={5000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  resetButton: {
    borderRadius: borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  loginButton: {
    // Custom styles if needed
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

