/**
 * Login Screen Component
 * Handles user authentication with email and password
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors, spacing, borderRadius } from '../constants/theme';
import { SUCCESS_MESSAGES } from '../constants';
import type { LoginScreenProps } from '../navigation/types';

/**
 * LoginScreen Component
 * 
 * Provides email/password authentication interface
 * Includes navigation to registration and password reset
 */
export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      await login(email.trim(), password);
      setSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  /**
   * Navigate to registration screen
   */
  const handleRegister = () => {
    navigation.navigate('Register');
  };

  /**
   * Navigate to forgot password screen
   */
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (loading) {
    return <LoadingSpinner message="Signing in..." />;
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
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to your Receipt Organizer account
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
                error={!!error && !email.trim()}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={styles.input}
                error={!!error && !password.trim()}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                Sign In
              </Button>

              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.forgotButton}
              >
                Forgot Password?
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Don't have an account?
            </Text>
            <Button
              mode="text"
              onPress={handleRegister}
              style={styles.registerButton}
            >
              Create Account
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
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  registerButton: {
    // Custom styles if needed
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

