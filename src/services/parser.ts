/**
 * Receipt Text Parsing Service
 * Extracts structured data from OCR text
 */

import { ParsedReceipt, Currency } from '../types';
import { PARSING_CONFIG, DEFAULTS } from '../constants';

/**
 * Parse receipt text and extract structured data
 */
export const parseReceiptText = (rawText: string): ParsedReceipt => {
  const text = rawText.trim();
  
  if (!text) {
    return createEmptyParsedReceipt();
  }

  try {
    const merchant = extractMerchant(text);
    const purchaseDate = extractDate(text);
    const amounts = extractAmounts(text);
    const currency = extractCurrency(text);
    
    // Calculate confidence based on extracted data quality
    const confidence = calculateParsingConfidence({
      merchant,
      purchaseDate,
      amounts,
      currency,
      textLength: text.length,
    });

    return {
      merchant: merchant || DEFAULTS.MERCHANT,
      purchaseDate,
      subtotal: amounts.subtotal,
      tax: amounts.tax,
      total: amounts.total,
      currency: currency || Currency.USD,
      confidence,
      fields: {
        rawText: text,
        extractedMerchant: merchant || '',
        extractedDate: purchaseDate || '',
        extractedAmounts: JSON.stringify(amounts),
        extractedCurrency: currency || '',
        confidence: confidence.toString(),
      },
    };
  } catch (error: any) {
    console.error('Receipt parsing error:', error);
    return {
      ...createEmptyParsedReceipt(),
      fields: {
        rawText: text,
        error: error.message,
      },
    };
  }
};

/**
 * Create empty parsed receipt with defaults
 */
const createEmptyParsedReceipt = (): ParsedReceipt => ({
  merchant: DEFAULTS.MERCHANT,
  purchaseDate: null,
  subtotal: null,
  tax: null,
  total: null,
  currency: Currency.USD,
  confidence: 0,
  fields: {},
});

/**
 * Extract merchant name from receipt text
 */
const extractMerchant = (text: string): string | null => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length === 0) return null;

  // Check for known merchant patterns
  const textLower = text.toLowerCase();
  for (const pattern of PARSING_CONFIG.MERCHANT_PATTERNS) {
    if (textLower.includes(pattern.toLowerCase())) {
      return capitalizeWords(pattern);
    }
  }

  // Try to extract from first few lines (common receipt format)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that look like addresses or phone numbers
    if (isAddressLine(line) || isPhoneLine(line)) {
      continue;
    }
    
    // Skip lines with only numbers or special characters
    if (!/[a-zA-Z]/.test(line) || line.length < 3) {
      continue;
    }
    
    // Skip lines that look like dates or amounts
    if (isDateLine(line) || isAmountLine(line)) {
      continue;
    }
    
    // This line likely contains the merchant name
    return cleanMerchantName(line);
  }

  return null;
};

/**
 * Extract purchase date from receipt text
 */
const extractDate = (text: string): string | null => {
  for (const pattern of PARSING_CONFIG.DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[0];
        const date = new Date(dateStr);
        
        // Validate date is reasonable (not in future, not too old)
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        
        if (date <= now && date >= oneYearAgo) {
          return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        }
      } catch {
        // Invalid date, continue searching
      }
    }
  }

  return null;
};

/**
 * Extract amounts (total, subtotal, tax) from receipt text
 */
const extractAmounts = (text: string): {
  total: number | null;
  subtotal: number | null;
  tax: number | null;
} => {
  const amounts = {
    total: null as number | null,
    subtotal: null as number | null,
    tax: null as number | null,
  };

  // Extract total
  for (const pattern of PARSING_CONFIG.TOTAL_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        amounts.total = amount;
        break;
      }
    }
  }

  // Extract tax
  for (const pattern of PARSING_CONFIG.TAX_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount >= 0) {
        amounts.tax = amount;
        break;
      }
    }
  }

  // Extract subtotal
  for (const pattern of PARSING_CONFIG.SUBTOTAL_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        amounts.subtotal = amount;
        break;
      }
    }
  }

  // Validate amounts relationship
  if (amounts.total && amounts.subtotal && amounts.tax) {
    const calculatedTotal = amounts.subtotal + amounts.tax;
    const difference = Math.abs(calculatedTotal - amounts.total);
    
    // If the calculated total doesn't match, prefer the explicit total
    if (difference > 0.02) { // Allow for small rounding differences
      console.warn('Amount validation failed:', {
        total: amounts.total,
        subtotal: amounts.subtotal,
        tax: amounts.tax,
        calculated: calculatedTotal,
        difference,
      });
    }
  }

  return amounts;
};

/**
 * Extract currency from receipt text
 */
const extractCurrency = (text: string): Currency | null => {
  // Check for currency symbols
  for (const [symbol, currency] of Object.entries(PARSING_CONFIG.CURRENCY_SYMBOLS)) {
    if (text.includes(symbol)) {
      return currency as Currency;
    }
  }

  // Check for currency codes
  const currencyPattern = /\b(USD|CAD|EUR|GBP)\b/i;
  const match = text.match(currencyPattern);
  if (match) {
    return match[1].toUpperCase() as Currency;
  }

  return null;
};

/**
 * Calculate parsing confidence based on extracted data quality
 */
const calculateParsingConfidence = (data: {
  merchant: string | null;
  purchaseDate: string | null;
  amounts: { total: number | null; subtotal: number | null; tax: number | null };
  currency: Currency | null;
  textLength: number;
}): number => {
  let confidence = 0;
  let maxConfidence = 0;

  // Merchant confidence (30% weight)
  maxConfidence += 0.3;
  if (data.merchant && data.merchant !== DEFAULTS.MERCHANT) {
    confidence += 0.3;
  }

  // Date confidence (20% weight)
  maxConfidence += 0.2;
  if (data.purchaseDate) {
    confidence += 0.2;
  }

  // Amount confidence (40% weight)
  maxConfidence += 0.4;
  if (data.amounts.total) {
    confidence += 0.2;
  }
  if (data.amounts.subtotal || data.amounts.tax) {
    confidence += 0.1;
  }
  if (data.amounts.total && data.amounts.subtotal && data.amounts.tax) {
    // Bonus for having all amounts
    confidence += 0.1;
  }

  // Currency confidence (10% weight)
  maxConfidence += 0.1;
  if (data.currency) {
    confidence += 0.1;
  }

  // Text length penalty for very short text
  if (data.textLength < 50) {
    confidence *= 0.8;
  }

  return Math.min(confidence / maxConfidence, 1.0);
};

/**
 * Helper functions for text analysis
 */

const isAddressLine = (line: string): boolean => {
  const addressPatterns = [
    /\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive)/i,
    /\b\d{5}(-\d{4})?\b/, // ZIP code
    /\b[A-Z]{2}\s+\d{5}\b/, // State + ZIP
  ];
  
  return addressPatterns.some(pattern => pattern.test(line));
};

const isPhoneLine = (line: string): boolean => {
  const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  return phonePattern.test(line);
};

const isDateLine = (line: string): boolean => {
  return PARSING_CONFIG.DATE_PATTERNS.some(pattern => pattern.test(line));
};

const isAmountLine = (line: string): boolean => {
  const amountPattern = /\$?\d+\.?\d*/;
  return amountPattern.test(line) && line.length < 20;
};

const cleanMerchantName = (name: string): string => {
  return name
    .replace(/[^\w\s&'-]/g, '') // Remove special characters except &, ', -
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Advanced parsing for specific receipt formats
 */
export const parseReceiptByFormat = (text: string, format: 'grocery' | 'restaurant' | 'gas' | 'retail'): ParsedReceipt => {
  // TODO: Implement format-specific parsing logic
  // This would use different patterns and rules based on receipt type
  return parseReceiptText(text);
};

/**
 * Validate parsed receipt data
 */
export const validateParsedReceipt = (parsed: ParsedReceipt): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required fields
  if (!parsed.merchant || parsed.merchant === DEFAULTS.MERCHANT) {
    warnings.push('Merchant name not detected');
  }

  if (!parsed.total || parsed.total <= 0) {
    errors.push('Total amount not detected or invalid');
  }

  if (!parsed.purchaseDate) {
    warnings.push('Purchase date not detected');
  }

  // Validate amount relationships
  if (parsed.total && parsed.subtotal && parsed.tax) {
    const calculatedTotal = parsed.subtotal + parsed.tax;
    const difference = Math.abs(calculatedTotal - parsed.total);
    
    if (difference > 0.02) {
      warnings.push('Amount calculations may be incorrect');
    }
  }

  // Check confidence threshold
  if (parsed.confidence < DEFAULTS.CONFIDENCE_THRESHOLD) {
    warnings.push('Low parsing confidence - please verify extracted data');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// TODO: Implement machine learning-based parsing improvements
// TODO: Add support for multi-language receipts
// TODO: Implement receipt template matching for better accuracy
// TODO: Add support for itemized receipt parsing
// TODO: Implement receipt category auto-detection
// TODO: Add support for loyalty card and discount parsing

