/**
 * Core TypeScript interfaces and types for the Receipt Organizer app
 */

// User related types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Receipt related types
export interface Receipt {
  id: string;
  userId: string;
  merchant: string;
  purchaseDate: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: Currency;
  imageUrl: string;
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional metadata
  category?: ReceiptCategory;
  notes?: string;
  tags?: string[];
}

// Parsed receipt data from OCR
export interface ParsedReceipt {
  merchant: string;
  purchaseDate: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: Currency;
  fields: Record<string, string>;
  confidence: number; // 0-1 confidence score
}

// Receipt creation/update payload
export interface ReceiptInput {
  merchant: string;
  purchaseDate?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: Currency;
  imageUrl: string;
  rawText: string;
  category?: ReceiptCategory;
  notes?: string;
  tags?: string[];
}

// Enums
export enum Currency {
  USD = 'USD',
  CAD = 'CAD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum ReceiptCategory {
  FOOD = 'Food & Dining',
  GROCERIES = 'Groceries',
  TRANSPORTATION = 'Transportation',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  HEALTHCARE = 'Healthcare',
  UTILITIES = 'Utilities',
  BUSINESS = 'Business',
  OTHER = 'Other',
}

export enum ReceiptStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// Filter and search types
export interface ReceiptFilters {
  merchant?: string;
  category?: ReceiptCategory;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: Currency;
  tags?: string[];
}

export interface ReceiptSearchParams {
  query?: string;
  filters?: ReceiptFilters;
  sortBy?: 'date' | 'amount' | 'merchant';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// OCR and image processing types
export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export enum AnalyticsEvents {
  SCAN_START = 'scan_start',
  SCAN_SUCCESS = 'scan_success',
  SCAN_ERROR = 'scan_error',
  RECEIPT_SAVED = 'receipt_saved',
  RECEIPT_EDITED = 'receipt_edited',
  RECEIPT_DELETED = 'receipt_deleted',
  FILTER_APPLIED = 'filter_applied',
  EXPORT_INITIATED = 'export_initiated',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SIGNUP = 'signup',
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  OCR_ERROR = 'OCR_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Navigation types (will be extended in navigation/types.ts)
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ReceiptDetail: { receiptId: string };
};

// Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface ReceiptContextType {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  merchants: string[];
  // CRUD operations
  addReceipt: (receipt: ReceiptInput) => Promise<Receipt>;
  updateReceipt: (id: string, updates: Partial<ReceiptInput>) => Promise<Receipt>;
  deleteReceipt: (id: string) => Promise<void>;
  getReceipt: (id: string) => Promise<Receipt | null>;
  // List operations
  loadReceipts: (params?: ReceiptSearchParams) => Promise<void>;
  refreshReceipts: () => Promise<void>;
  // Utility functions
  clearError: () => void;
  getMerchants: () => string[];
  getReceiptsByMerchant: (merchant: string) => Receipt[];
}

// TODO: Add types for future features
// - CSV export types
// - Cloud backup types
// - Receipt sharing types
// - Bulk operations types
// - Advanced analytics types

