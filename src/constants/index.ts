/**
 * Application constants and configuration values
 */

import { Dimensions } from 'react-native';

// Device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DIMENSIONS = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  IS_SMALL_DEVICE: SCREEN_WIDTH < 375,
  IS_LARGE_DEVICE: SCREEN_WIDTH > 414,
} as const;

// API Configuration
export const API_CONFIG = {
  // Firebase configuration will be loaded from environment variables
  FIREBASE_CONFIG: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
  
  // Google Cloud Vision API
  GOOGLE_CLOUD_VISION_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
  GOOGLE_CLOUD_VISION_URL: 'https://vision.googleapis.com/v1/images:annotate',
  
  // Request timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  OCR_TIMEOUT: 60000, // 60 seconds for OCR processing
  UPLOAD_TIMEOUT: 120000, // 2 minutes for image uploads
} as const;

// Storage keys for AsyncStorage/SecureStore
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  RECEIPT_CACHE: 'receipt_cache',
  APP_SETTINGS: 'app_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Receipt parsing constants
export const PARSING_CONFIG = {
  // Merchant name patterns (common store names)
  MERCHANT_PATTERNS: [
    // Grocery stores
    'walmart', 'target', 'costco', 'safeway', 'kroger', 'publix', 'whole foods',
    'trader joe', 'aldi', 'food lion', 'giant', 'stop & shop', 'wegmans',
    
    // Restaurants
    'mcdonald', 'burger king', 'subway', 'starbucks', 'dunkin', 'kfc',
    'pizza hut', 'domino', 'taco bell', 'chipotle', 'panera',
    
    // Gas stations
    'shell', 'exxon', 'bp', 'chevron', 'mobil', 'texaco', 'citgo',
    
    // Retail
    'amazon', 'best buy', 'home depot', 'lowe\'s', 'cvs', 'walgreens',
    'rite aid', 'dollar tree', 'family dollar', 'tj maxx', 'marshalls',
    
    // Pharmacies
    'cvs pharmacy', 'walgreens pharmacy', 'rite aid pharmacy',
  ],
  
  // Date format patterns
  DATE_PATTERNS: [
    /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/, // MM/DD/YYYY
    /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/, // YYYY-MM-DD
    /\b(\w{3})\s+(\d{1,2}),?\s+(\d{4})\b/, // Mon DD, YYYY
    /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/, // MM-DD-YYYY
    /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/, // MM.DD.YYYY
  ],
  
  // Amount patterns
  TOTAL_PATTERNS: [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount\s+due[:\s]*\$?(\d+\.?\d*)/i,
    /balance[:\s]*\$?(\d+\.?\d*)/i,
    /grand\s+total[:\s]*\$?(\d+\.?\d*)/i,
    /final\s+total[:\s]*\$?(\d+\.?\d*)/i,
  ],
  
  // Tax patterns
  TAX_PATTERNS: [
    /tax[:\s]*\$?(\d+\.?\d*)/i,
    /gst[:\s]*\$?(\d+\.?\d*)/i,
    /hst[:\s]*\$?(\d+\.?\d*)/i,
    /vat[:\s]*\$?(\d+\.?\d*)/i,
    /sales\s+tax[:\s]*\$?(\d+\.?\d*)/i,
  ],
  
  // Subtotal patterns
  SUBTOTAL_PATTERNS: [
    /subtotal[:\s]*\$?(\d+\.?\d*)/i,
    /sub\s+total[:\s]*\$?(\d+\.?\d*)/i,
    /before\s+tax[:\s]*\$?(\d+\.?\d*)/i,
  ],
  
  // Currency symbols
  CURRENCY_SYMBOLS: {
    '$': 'USD',
    'C$': 'CAD',
    '€': 'EUR',
    '£': 'GBP',
  },
} as const;

// Image processing constants
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Animation durations
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please try logging in again.',
  OCR_ERROR: 'Failed to process receipt image. Please try again.',
  STORAGE_ERROR: 'Failed to save data. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  CAMERA_PERMISSION: 'Camera permission is required to scan receipts.',
  GALLERY_PERMISSION: 'Photo library permission is required to select images.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  RECEIPT_SAVED: 'Receipt saved successfully!',
  RECEIPT_UPDATED: 'Receipt updated successfully!',
  RECEIPT_DELETED: 'Receipt deleted successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET: 'Password reset email sent!',
} as const;

// Feature flags for development
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_DEBUG_LOGGING: __DEV__,
  ENABLE_OFFLINE_MODE: false, // TODO: Implement offline mode
  ENABLE_CLOUD_BACKUP: false, // TODO: Implement cloud backup
  ENABLE_CSV_EXPORT: false, // TODO: Implement CSV export
} as const;

// App metadata
export const APP_INFO = {
  NAME: 'Receipt Organizer',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORT_EMAIL: 'support@receiptorganizer.com',
  PRIVACY_POLICY_URL: 'https://receiptorganizer.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://receiptorganizer.com/terms',
} as const;

// Default values
export const DEFAULTS = {
  CURRENCY: 'USD',
  MERCHANT: 'Uncategorized',
  CATEGORY: 'Other',
  CONFIDENCE_THRESHOLD: 0.7, // Minimum confidence for OCR results
} as const;

