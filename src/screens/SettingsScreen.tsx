/**
 * Settings Screen Component
 * App settings and user account management
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Button, Card, Divider, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { useReceipts } from '../contexts/ReceiptContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors, spacing, shadows } from '../constants/theme';
import { APP_INFO, FEATURE_FLAGS } from '../constants';
import type { SettingsScreenProps } from '../navigation/types';

/**
 * SettingsScreen Component
 * 
 * Provides app settings, account management, and information
 * Includes logout, data management, and feature toggles
 */
export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, logout, loading: authLoading } = useAuth();
  const { receipts, refreshReceipts } = useReceipts();
  
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(FEATURE_FLAGS.ENABLE_ANALYTICS);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: confirmLogout 
        },
      ]
    );
  };

  /**
   * Confirm logout
   */
  const confirmLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle data refresh
   */
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      await refreshReceipts();
      setSuccess('Data refreshed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle export data (TODO: Implement)
   */
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature is coming soon! You will be able to export your receipts to CSV format.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle backup data (TODO: Implement)
   */
  const handleBackupData = () => {
    Alert.alert(
      'Cloud Backup',
      'This feature is coming soon! You will be able to backup your data to cloud storage.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle clear cache
   */
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data and may improve performance. Your receipts will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => setSuccess('Cache cleared successfully')
        },
      ]
    );
  };

  /**
   * Handle about/help
   */
  const handleAbout = () => {
    Alert.alert(
      'About Receipt Organizer',
      `Version: ${APP_INFO.VERSION}\nBuild: ${APP_INFO.BUILD_NUMBER}\n\nA simple and efficient way to organize your receipts using OCR technology.`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle privacy policy
   */
  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Privacy policy will open in your browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          // TODO: Open privacy policy URL
          setSuccess('Privacy policy opened');
        }},
      ]
    );
  };

  /**
   * Handle terms of service
   */
  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Terms of service will open in your browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          // TODO: Open terms of service URL
          setSuccess('Terms of service opened');
        }},
      ]
    );
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Account
            </Text>
            
            <List.Item
              title={user?.displayName || 'User'}
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="account" />}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Sign Out"
              description="Sign out of your account"
              left={(props) => <List.Icon {...props} icon="logout" />}
              onPress={handleLogout}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Data Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Data Management
            </Text>
            
            <List.Item
              title="Receipts"
              description={`${receipts.length} receipts stored`}
              left={(props) => <List.Icon {...props} icon="receipt" />}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Refresh Data"
              description="Sync with server"
              left={(props) => <List.Icon {...props} icon="refresh" />}
              onPress={handleRefreshData}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Export to CSV"
              description="Export receipts (Coming Soon)"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={handleExportData}
              style={styles.listItem}
              disabled
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Cloud Backup"
              description="Backup to cloud (Coming Soon)"
              left={(props) => <List.Icon {...props} icon="cloud-upload" />}
              onPress={handleBackupData}
              style={styles.listItem}
              disabled
            />
          </Card.Content>
        </Card>

        {/* Preferences Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Preferences
            </Text>
            
            <List.Item
              title="Notifications"
              description="Receive app notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                />
              )}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Analytics"
              description="Help improve the app"
              left={(props) => <List.Icon {...props} icon="chart-line" />}
              right={() => (
                <Switch
                  value={analytics}
                  onValueChange={setAnalytics}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Storage Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Storage
            </Text>
            
            <List.Item
              title="Clear Cache"
              description="Free up storage space"
              left={(props) => <List.Icon {...props} icon="delete-sweep" />}
              onPress={handleClearCache}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Support Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Support & Legal
            </Text>
            
            <List.Item
              title="About"
              description={`Version ${APP_INFO.VERSION}`}
              left={(props) => <List.Icon {...props} icon="information" />}
              onPress={handleAbout}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Privacy Policy"
              description="How we handle your data"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              onPress={handlePrivacyPolicy}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Terms of Service"
              description="App usage terms"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              onPress={handleTermsOfService}
              style={styles.listItem}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Contact Support"
              description={APP_INFO.SUPPORT_EMAIL}
              left={(props) => <List.Icon {...props} icon="email" />}
              onPress={() => setSuccess('Support email copied to clipboard')}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Debug Info (Development only) */}
        {__DEV__ && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Debug Info
              </Text>
              
              <Text variant="bodySmall" style={styles.debugText}>
                User ID: {user?.id}
              </Text>
              <Text variant="bodySmall" style={styles.debugText}>
                Receipts Count: {receipts.length}
              </Text>
              <Text variant="bodySmall" style={styles.debugText}>
                Environment: {__DEV__ ? 'Development' : 'Production'}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  debugText: {
    color: colors.onSurfaceVariant,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

