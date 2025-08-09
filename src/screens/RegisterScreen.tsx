/**
 * Register Screen Component
 * Handles new user registration
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors, spacing, borderRadius } from '../constants/theme';
import { SUCCESS_MESSAGES } from '../constants';
import type { RegisterScreenProps } from '../navigation/types';

/**
 * RegisterScreen Component
 * 
 * Provides user registration interface with email, password, and display name
 * Includes form validation and error handling
 */
export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Validate form inputs
   */
  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      return 'Password is required';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  /**
   * Handle registration form submission
   */
  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      await register(email.trim(), password, displayName.trim() || undefined);
      setSuccess(SUCCESS_MESSAGES.SIGNUP_SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  /**
   * Navigate back to login screen
   */
  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (loading) {
    return <LoadingSpinner message="Creating account..." />;
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
              Create Account
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Join Receipt Organizer to start managing your receipts
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="Display Name (Optional)"
                value={displayName}
                onChangeText={setDisplayName}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                style={styles.input}
              />

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

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                style={styles.input}
                error={!!error && (!password.trim() || password.length < 6)}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                style={styles.input}
                error={!!error && password !== confirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Already have an account?
            </Text>
            <Button
              mode="text"
              onPress={handleBackToLogin}
              style={styles.loginButton}
            >
              Sign In
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
        duration={3000}
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
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  registerButton: {
    marginTop: spacing.md,
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

