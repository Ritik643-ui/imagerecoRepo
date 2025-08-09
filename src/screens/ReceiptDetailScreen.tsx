/**
 * Receipt Detail Screen Component
 * Displays and allows editing of receipt details
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Chip, Menu, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { useReceipts } from '../contexts/ReceiptContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Receipt, Currency, ReceiptCategory } from '../types';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { SUCCESS_MESSAGES } from '../constants';
import type { ReceiptDetailScreenProps } from '../navigation/types';

/**
 * ReceiptDetailScreen Component
 * 
 * Displays receipt details with editing capabilities
 * Allows users to update receipt information and delete receipts
 */
export default function ReceiptDetailScreen({ route, navigation }: ReceiptDetailScreenProps) {
  const { receiptId } = route.params;
  const { getReceipt, updateReceipt, deleteReceipt, loading } = useReceipts();
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [merchant, setMerchant] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [total, setTotal] = useState('');
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [category, setCategory] = useState<ReceiptCategory>(ReceiptCategory.OTHER);
  const [notes, setNotes] = useState('');
  
  // Menu states
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  /**
   * Load receipt data
   */
  useEffect(() => {
    loadReceipt();
  }, [receiptId]);

  /**
   * Load receipt from context
   */
  const loadReceipt = async () => {
    try {
      const receiptData = await getReceipt(receiptId);
      if (receiptData) {
        setReceipt(receiptData);
        populateForm(receiptData);
      } else {
        setError('Receipt not found');
      }
    } catch (err: any) {
      setError('Failed to load receipt');
    }
  };

  /**
   * Populate form with receipt data
   */
  const populateForm = (receiptData: Receipt) => {
    setMerchant(receiptData.merchant);
    setPurchaseDate(receiptData.purchaseDate || '');
    setSubtotal(receiptData.subtotal?.toString() || '');
    setTax(receiptData.tax?.toString() || '');
    setTotal(receiptData.total?.toString() || '');
    setCurrency(receiptData.currency);
    setCategory(receiptData.category || ReceiptCategory.OTHER);
    setNotes(receiptData.notes || '');
  };

  /**
   * Handle edit mode toggle
   */
  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing - restore original values
      if (receipt) {
        populateForm(receipt);
      }
    }
    setEditing(!editing);
    setError('');
  };

  /**
   * Handle save changes
   */
  const handleSave = async () => {
    if (!receipt) return;

    try {
      setSaving(true);
      setError('');

      const updates = {
        merchant: merchant.trim(),
        purchaseDate: purchaseDate.trim() || null,
        subtotal: subtotal.trim() ? parseFloat(subtotal) : null,
        tax: tax.trim() ? parseFloat(tax) : null,
        total: total.trim() ? parseFloat(total) : null,
        currency,
        category,
        notes: notes.trim() || undefined,
      };

      const updatedReceipt = await updateReceipt(receipt.id, updates);
      setReceipt(updatedReceipt);
      setEditing(false);
      setSuccess(SUCCESS_MESSAGES.RECEIPT_UPDATED);
    } catch (err: any) {
      setError(err.message || 'Failed to update receipt');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle delete receipt
   */
  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDelete 
        },
      ]
    );
  };

  /**
   * Confirm delete receipt
   */
  const confirmDelete = async () => {
    if (!receipt) return;

    try {
      await deleteReceipt(receipt.id);
      setSuccess(SUCCESS_MESSAGES.RECEIPT_DELETED);
      // Navigate back after short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete receipt');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  /**
   * Format currency amount
   */
  const formatAmount = (amount: number | null): string => {
    if (amount === null) return 'N/A';
    return amount.toFixed(2);
  };

  if (loading && !receipt) {
    return <LoadingSpinner message="Loading receipt..." />;
  }

  if (error && !receipt) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadReceipt}
      />
    );
  }

  if (!receipt) {
    return (
      <ErrorMessage
        message="Receipt not found"
        onRetry={() => navigation.goBack()}
        retryText="Go Back"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Receipt Image */}
        {receipt.imageUrl && (
          <Card style={styles.imageCard}>
            <Image 
              source={{ uri: receipt.imageUrl }} 
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </Card>
        )}

        {/* Receipt Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>
                Receipt Details
              </Text>
              <View style={styles.headerButtons}>
                <Button
                  mode={editing ? 'outlined' : 'contained-tonal'}
                  onPress={handleEditToggle}
                  icon={editing ? 'close' : 'pencil'}
                  style={styles.editButton}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </View>
            </View>

            {/* Merchant */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>Merchant</Text>
              {editing ? (
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  mode="outlined"
                  style={styles.input}
                />
              ) : (
                <Text variant="bodyLarge" style={styles.value}>{receipt.merchant}</Text>
              )}
            </View>

            {/* Purchase Date */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>Date</Text>
              {editing ? (
                <TextInput
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
              ) : (
                <Text variant="bodyLarge" style={styles.value}>
                  {formatDate(receipt.purchaseDate)}
                </Text>
              )}
            </View>

            {/* Currency */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>Currency</Text>
              {editing ? (
                <Menu
                  visible={currencyMenuVisible}
                  onDismiss={() => setCurrencyMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setCurrencyMenuVisible(true)}
                      style={styles.menuButton}
                    >
                      {currency}
                    </Button>
                  }
                >
                  {Object.values(Currency).map((curr) => (
                    <Menu.Item
                      key={curr}
                      onPress={() => {
                        setCurrency(curr);
                        setCurrencyMenuVisible(false);
                      }}
                      title={curr}
                    />
                  ))}
                </Menu>
              ) : (
                <Text variant="bodyLarge" style={styles.value}>{receipt.currency}</Text>
              )}
            </View>

            {/* Amounts */}
            <View style={styles.amountsRow}>
              <View style={styles.amountField}>
                <Text variant="labelLarge" style={styles.label}>Subtotal</Text>
                {editing ? (
                  <TextInput
                    value={subtotal}
                    onChangeText={setSubtotal}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.value}>
                    ${formatAmount(receipt.subtotal)}
                  </Text>
                )}
              </View>

              <View style={styles.amountField}>
                <Text variant="labelLarge" style={styles.label}>Tax</Text>
                {editing ? (
                  <TextInput
                    value={tax}
                    onChangeText={setTax}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.value}>
                    ${formatAmount(receipt.tax)}
                  </Text>
                )}
              </View>
            </View>

            {/* Total */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>Total</Text>
              {editing ? (
                <TextInput
                  value={total}
                  onChangeText={setTotal}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              ) : (
                <Text variant="titleLarge" style={styles.totalValue}>
                  ${formatAmount(receipt.total)}
                </Text>
              )}
            </View>

            {/* Category */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>Category</Text>
              {editing ? (
                <Menu
                  visible={categoryMenuVisible}
                  onDismiss={() => setCategoryMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setCategoryMenuVisible(true)}
                      style={styles.menuButton}
                    >
                      {category}
                    </Button>
                  }
                >
                  {Object.values(ReceiptCategory).map((cat) => (
                    <Menu.Item
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        setCategoryMenuVisible(false);
                      }}
                      title={cat}
                    />
                  ))}
                </Menu>
              ) : (
                <Chip mode="outlined" style={styles.categoryChip}>
                  {receipt.category || ReceiptCategory.OTHER}
                </Chip>
              )}
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text variant="labelLarge" style={styles.label}>Notes</Text>
              {editing ? (
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              ) : (
                <Text variant="bodyLarge" style={styles.value}>
                  {receipt.notes || 'No notes'}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            {editing && (
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  style={styles.saveButton}
                  icon="content-save"
                >
                  Save Changes
                </Button>
              </View>
            )}

            {!editing && (
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={handleDelete}
                  style={styles.deleteButton}
                  textColor={colors.error}
                  icon="delete"
                >
                  Delete Receipt
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Metadata */}
        <Card style={styles.metadataCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.metadataTitle}>
              Metadata
            </Text>
            <Text variant="bodySmall" style={styles.metadata}>
              Created: {format(receipt.createdAt, 'MMM dd, yyyy HH:mm')}
            </Text>
            <Text variant="bodySmall" style={styles.metadata}>
              Updated: {format(receipt.updatedAt, 'MMM dd, yyyy HH:mm')}
            </Text>
            <Text variant="bodySmall" style={styles.metadata}>
              ID: {receipt.id}
            </Text>
          </Card.Content>
        </Card>
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
  imageCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
  },
  detailsCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    // Custom styles if needed
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.onSurface,
  },
  totalValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
  },
  menuButton: {
    alignSelf: 'flex-start',
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  amountsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  amountField: {
    flex: 1,
  },
  actionButtons: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  saveButton: {
    // Custom styles if needed
  },
  deleteButton: {
    borderColor: colors.error,
  },
  metadataCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  metadataTitle: {
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  metadata: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

