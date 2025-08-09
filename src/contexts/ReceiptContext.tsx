/**
 * Receipt Context Provider
 * Manages receipt data state and operations
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { Receipt, ReceiptInput, ReceiptContextType, ReceiptSearchParams } from '../types';
import { useAuth } from './AuthContext';
import * as firestoreService from '../services/firestore';
import { logAnalyticsEvent } from '../services/analytics';
import { AnalyticsEvents } from '../types';

// Create the context
const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

interface ReceiptProviderProps {
  children: ReactNode;
}

/**
 * Receipt Provider Component
 * 
 * Provides receipt data state and CRUD operations to the entire app
 * Handles Firestore integration and local state management
 */
export function ReceiptProvider({ children }: ReceiptProviderProps) {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Get unique merchants from receipts
   */
  const getMerchants = (): string[] => {
    const merchantSet = new Set(receipts.map(receipt => receipt.merchant));
    return Array.from(merchantSet).sort();
  };

  /**
   * Get receipts filtered by merchant
   */
  const getReceiptsByMerchant = (merchant: string): Receipt[] => {
    return receipts.filter(receipt => receipt.merchant === merchant);
  };

  /**
   * Load receipts from Firestore
   */
  const loadReceipts = async (params?: ReceiptSearchParams): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const fetchedReceipts = await firestoreService.listReceipts(user.id, params);
      setReceipts(fetchedReceipts);
    } catch (err: any) {
      console.error('Error loading receipts:', err);
      setError('Failed to load receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh receipts (reload from server)
   */
  const refreshReceipts = async (): Promise<void> => {
    await loadReceipts();
  };

  /**
   * Add a new receipt
   */
  const addReceipt = async (receiptInput: ReceiptInput): Promise<Receipt> => {
    if (!user) {
      throw new Error('User must be authenticated to add receipts');
    }

    try {
      setLoading(true);
      setError(null);

      // Save to Firestore
      const newReceipt = await firestoreService.saveReceipt(user.id, receiptInput);
      
      // Update local state optimistically
      setReceipts(prev => [newReceipt, ...prev]);

      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.RECEIPT_SAVED,
        properties: {
          merchant: newReceipt.merchant,
          total: newReceipt.total,
          currency: newReceipt.currency,
        },
        timestamp: new Date(),
        userId: user.id,
      });

      return newReceipt;
    } catch (err: any) {
      console.error('Error adding receipt:', err);
      setError('Failed to save receipt. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing receipt
   */
  const updateReceipt = async (id: string, updates: Partial<ReceiptInput>): Promise<Receipt> => {
    if (!user) {
      throw new Error('User must be authenticated to update receipts');
    }

    try {
      setLoading(true);
      setError(null);

      // Update in Firestore
      const updatedReceipt = await firestoreService.updateReceipt(id, updates);
      
      // Update local state
      setReceipts(prev => 
        prev.map(receipt => 
          receipt.id === id ? updatedReceipt : receipt
        )
      );

      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.RECEIPT_EDITED,
        properties: {
          receiptId: id,
          updatedFields: Object.keys(updates),
        },
        timestamp: new Date(),
        userId: user.id,
      });

      return updatedReceipt;
    } catch (err: any) {
      console.error('Error updating receipt:', err);
      setError('Failed to update receipt. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a receipt
   */
  const deleteReceipt = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to delete receipts');
    }

    try {
      setLoading(true);
      setError(null);

      // Delete from Firestore
      await firestoreService.deleteReceipt(id);
      
      // Update local state
      setReceipts(prev => prev.filter(receipt => receipt.id !== id));

      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.RECEIPT_DELETED,
        properties: {
          receiptId: id,
        },
        timestamp: new Date(),
        userId: user.id,
      });
    } catch (err: any) {
      console.error('Error deleting receipt:', err);
      setError('Failed to delete receipt. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a single receipt by ID
   */
  const getReceipt = async (id: string): Promise<Receipt | null> => {
    try {
      // First check local state
      const localReceipt = receipts.find(receipt => receipt.id === id);
      if (localReceipt) {
        return localReceipt;
      }

      // If not found locally, fetch from Firestore
      const receipt = await firestoreService.getReceipt(id);
      return receipt;
    } catch (err: any) {
      console.error('Error getting receipt:', err);
      setError('Failed to load receipt. Please try again.');
      return null;
    }
  };

  /**
   * Load receipts when user changes
   */
  useEffect(() => {
    if (user) {
      loadReceipts();
    } else {
      // Clear receipts when user logs out
      setReceipts([]);
      setError(null);
    }
  }, [user]);

  const value: ReceiptContextType = {
    receipts,
    loading,
    error,
    merchants: getMerchants(),
    addReceipt,
    updateReceipt,
    deleteReceipt,
    getReceipt,
    loadReceipts,
    refreshReceipts,
    clearError,
    getMerchants,
    getReceiptsByMerchant,
  };

  return (
    <ReceiptContext.Provider value={value}>
      {children}
    </ReceiptContext.Provider>
  );
}

/**
 * Hook to use receipt context
 */
export function useReceipts(): ReceiptContextType {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}

