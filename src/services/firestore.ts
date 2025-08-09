/**
 * Firestore Database Service
 * Handles all receipt CRUD operations with Firestore
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';

import { db } from './firebase';
import { Receipt, ReceiptInput, ReceiptSearchParams, Currency } from '../types';
import { DEFAULTS } from '../constants';

// Collection names
const COLLECTIONS = {
  RECEIPTS: 'receipts',
  USERS: 'users',
} as const;

/**
 * Convert Firestore document to Receipt object
 */
const convertFirestoreReceipt = (doc: DocumentSnapshot): Receipt | null => {
  if (!doc.exists()) return null;

  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    userId: data.userId,
    merchant: data.merchant || DEFAULTS.MERCHANT,
    purchaseDate: data.purchaseDate || null,
    subtotal: data.subtotal || null,
    tax: data.tax || null,
    total: data.total || null,
    currency: data.currency || Currency.USD,
    imageUrl: data.imageUrl,
    rawText: data.rawText || '',
    category: data.category || undefined,
    notes: data.notes || undefined,
    tags: data.tags || undefined,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

/**
 * Convert Receipt object to Firestore document data
 */
const convertReceiptToFirestore = (userId: string, receipt: ReceiptInput) => {
  const now = Timestamp.now();
  
  return {
    userId,
    merchant: receipt.merchant || DEFAULTS.MERCHANT,
    purchaseDate: receipt.purchaseDate || null,
    subtotal: receipt.subtotal || null,
    tax: receipt.tax || null,
    total: receipt.total || null,
    currency: receipt.currency || Currency.USD,
    imageUrl: receipt.imageUrl,
    rawText: receipt.rawText || '',
    category: receipt.category || undefined,
    notes: receipt.notes || undefined,
    tags: receipt.tags || undefined,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Save a new receipt to Firestore
 */
export const saveReceipt = async (userId: string, receiptInput: ReceiptInput): Promise<Receipt> => {
  try {
    const receiptData = convertReceiptToFirestore(userId, receiptInput);
    const docRef = await addDoc(collection(db, COLLECTIONS.RECEIPTS), receiptData);
    
    // Get the created document to return complete receipt
    const createdDoc = await getDoc(docRef);
    const receipt = convertFirestoreReceipt(createdDoc);
    
    if (!receipt) {
      throw new Error('Failed to create receipt');
    }
    
    return receipt;
  } catch (error: any) {
    console.error('Error saving receipt:', error);
    throw new Error(`Failed to save receipt: ${error.message}`);
  }
};

/**
 * Get a single receipt by ID
 */
export const getReceipt = async (receiptId: string): Promise<Receipt | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.RECEIPTS, receiptId);
    const docSnap = await getDoc(docRef);
    
    return convertFirestoreReceipt(docSnap);
  } catch (error: any) {
    console.error('Error getting receipt:', error);
    throw new Error(`Failed to get receipt: ${error.message}`);
  }
};

/**
 * Update an existing receipt
 */
export const updateReceipt = async (receiptId: string, updates: Partial<ReceiptInput>): Promise<Receipt> => {
  try {
    const docRef = doc(db, COLLECTIONS.RECEIPTS, receiptId);
    
    // Prepare update data
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    await updateDoc(docRef, updateData);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    const receipt = convertFirestoreReceipt(updatedDoc);
    
    if (!receipt) {
      throw new Error('Failed to update receipt');
    }
    
    return receipt;
  } catch (error: any) {
    console.error('Error updating receipt:', error);
    throw new Error(`Failed to update receipt: ${error.message}`);
  }
};

/**
 * Delete a receipt
 */
export const deleteReceipt = async (receiptId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.RECEIPTS, receiptId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting receipt:', error);
    throw new Error(`Failed to delete receipt: ${error.message}`);
  }
};

/**
 * List receipts for a user with optional filtering and pagination
 */
export const listReceipts = async (
  userId: string, 
  params?: ReceiptSearchParams
): Promise<Receipt[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.RECEIPTS),
      where('userId', '==', userId)
    );
    
    // Apply filters
    if (params?.filters) {
      const { filters } = params;
      
      if (filters.merchant) {
        q = query(q, where('merchant', '==', filters.merchant));
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.currency) {
        q = query(q, where('currency', '==', filters.currency));
      }
      
      if (filters.dateFrom) {
        q = query(q, where('purchaseDate', '>=', filters.dateFrom.toISOString()));
      }
      
      if (filters.dateTo) {
        q = query(q, where('purchaseDate', '<=', filters.dateTo.toISOString()));
      }
      
      if (filters.minAmount) {
        q = query(q, where('total', '>=', filters.minAmount));
      }
      
      if (filters.maxAmount) {
        q = query(q, where('total', '<=', filters.maxAmount));
      }
    }
    
    // Apply sorting
    const sortBy = params?.sortBy || 'date';
    const sortOrder = params?.sortOrder || 'desc';
    
    switch (sortBy) {
      case 'date':
        q = query(q, orderBy('createdAt', sortOrder));
        break;
      case 'amount':
        q = query(q, orderBy('total', sortOrder));
        break;
      case 'merchant':
        q = query(q, orderBy('merchant', sortOrder));
        break;
      default:
        q = query(q, orderBy('createdAt', 'desc'));
    }
    
    // Apply pagination
    if (params?.limit) {
      q = query(q, limit(params.limit));
    }
    
    // Execute query
    const querySnapshot = await getDocs(q);
    const receipts: Receipt[] = [];
    
    querySnapshot.forEach((doc) => {
      const receipt = convertFirestoreReceipt(doc);
      if (receipt) {
        receipts.push(receipt);
      }
    });
    
    return receipts;
  } catch (error: any) {
    console.error('Error listing receipts:', error);
    throw new Error(`Failed to list receipts: ${error.message}`);
  }
};

/**
 * Get receipts count for a user
 */
export const getReceiptsCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.RECEIPTS),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error('Error getting receipts count:', error);
    throw new Error(`Failed to get receipts count: ${error.message}`);
  }
};

/**
 * Get unique merchants for a user
 */
export const getUserMerchants = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.RECEIPTS),
      where('userId', '==', userId),
      orderBy('merchant')
    );
    
    const querySnapshot = await getDocs(q);
    const merchants = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.merchant) {
        merchants.add(data.merchant);
      }
    });
    
    return Array.from(merchants).sort();
  } catch (error: any) {
    console.error('Error getting user merchants:', error);
    throw new Error(`Failed to get merchants: ${error.message}`);
  }
};

/**
 * Search receipts by text query
 */
export const searchReceipts = async (
  userId: string, 
  searchQuery: string,
  limit: number = 20
): Promise<Receipt[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that searches in merchant names
    // For production, consider using Algolia or similar service
    
    const q = query(
      collection(db, COLLECTIONS.RECEIPTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const receipts: Receipt[] = [];
    
    const searchLower = searchQuery.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const receipt = convertFirestoreReceipt(doc);
      if (receipt) {
        // Simple text matching
        const matchesMerchant = receipt.merchant.toLowerCase().includes(searchLower);
        const matchesNotes = receipt.notes?.toLowerCase().includes(searchLower);
        const matchesTotal = receipt.total?.toString().includes(searchQuery);
        
        if (matchesMerchant || matchesNotes || matchesTotal) {
          receipts.push(receipt);
        }
      }
    });
    
    return receipts;
  } catch (error: any) {
    console.error('Error searching receipts:', error);
    throw new Error(`Failed to search receipts: ${error.message}`);
  }
};

// TODO: Implement batch operations for bulk updates/deletes
// TODO: Implement receipt sharing functionality
// TODO: Add support for receipt attachments/multiple images
// TODO: Implement receipt categories management
// TODO: Add receipt analytics and reporting queries

