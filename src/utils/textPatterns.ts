/**
 * Text Pattern Utilities
 * Regular expressions and patterns for receipt text parsing
 */

/**
 * Date patterns for different formats
 */
export const DATE_PATTERNS = {
  // MM/DD/YYYY or M/D/YYYY
  US_FORMAT: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
  
  // YYYY-MM-DD
  ISO_FORMAT: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,
  
  // DD/MM/YYYY or D/M/YYYY
  EU_FORMAT: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
  
  // Month DD, YYYY
  LONG_FORMAT: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/gi,
  
  // DD-MM-YYYY
  DASH_FORMAT: /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/g,
  
  // DD.MM.YYYY
  DOT_FORMAT: /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g,
} as const;

/**
 * Amount patterns for different currencies and formats
 */
export const AMOUNT_PATTERNS = {
  // $XX.XX or $XX
  DOLLAR_AMOUNT: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
  
  // XX.XX (decimal amount)
  DECIMAL_AMOUNT: /\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/g,
  
  // Whole number amounts
  WHOLE_AMOUNT: /\b(\d{1,3}(?:,\d{3})*)\b/g,
  
  // European format (XX,XX)
  EUROPEAN_AMOUNT: /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,
} as const;

/**
 * Total amount patterns
 */
export const TOTAL_PATTERNS = [
  /total[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /amount\s+due[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /balance[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /grand\s+total[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /final\s+total[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /sum[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
] as const;

/**
 * Subtotal patterns
 */
export const SUBTOTAL_PATTERNS = [
  /subtotal[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /sub\s+total[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /before\s+tax[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /net\s+amount[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
] as const;

/**
 * Tax patterns
 */
export const TAX_PATTERNS = [
  /tax[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /gst[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /hst[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /vat[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /sales\s+tax[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /pst[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
] as const;

/**
 * Merchant name patterns (common store chains)
 */
export const MERCHANT_PATTERNS = [
  // Grocery stores
  /walmart/gi,
  /target/gi,
  /costco/gi,
  /safeway/gi,
  /kroger/gi,
  /publix/gi,
  /whole\s+foods/gi,
  /trader\s+joe/gi,
  /aldi/gi,
  /food\s+lion/gi,
  /giant/gi,
  /stop\s*&\s*shop/gi,
  /wegmans/gi,
  
  // Restaurants
  /mcdonald/gi,
  /burger\s+king/gi,
  /subway/gi,
  /starbucks/gi,
  /dunkin/gi,
  /kfc/gi,
  /pizza\s+hut/gi,
  /domino/gi,
  /taco\s+bell/gi,
  /chipotle/gi,
  /panera/gi,
  
  // Gas stations
  /shell/gi,
  /exxon/gi,
  /bp/gi,
  /chevron/gi,
  /mobil/gi,
  /texaco/gi,
  /citgo/gi,
  
  // Retail
  /amazon/gi,
  /best\s+buy/gi,
  /home\s+depot/gi,
  /lowe'?s/gi,
  /cvs/gi,
  /walgreens/gi,
  /rite\s+aid/gi,
  /dollar\s+tree/gi,
  /family\s+dollar/gi,
  /tj\s+maxx/gi,
  /marshalls/gi,
] as const;

/**
 * Currency patterns
 */
export const CURRENCY_PATTERNS = {
  USD: /\$|USD|US\$|dollar/gi,
  CAD: /C\$|CAD|canadian/gi,
  EUR: /€|EUR|euro/gi,
  GBP: /£|GBP|pound/gi,
} as const;

/**
 * Receipt header patterns (to identify receipt type)
 */
export const RECEIPT_TYPE_PATTERNS = {
  GROCERY: /grocery|market|food|supermarket/gi,
  RESTAURANT: /restaurant|cafe|diner|bistro|grill/gi,
  GAS: /gas|fuel|station|petroleum/gi,
  RETAIL: /store|shop|retail|mall/gi,
  PHARMACY: /pharmacy|drug|cvs|walgreens/gi,
} as const;

/**
 * Time patterns
 */
export const TIME_PATTERNS = [
  /\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/gi,
  /\b(\d{1,2}):(\d{2}):(\d{2})\b/g,
  /\b(\d{1,2})\.(\d{2})\b/g, // European time format
] as const;

/**
 * Address patterns
 */
export const ADDRESS_PATTERNS = [
  /\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court)/gi,
  /\b\d{5}(-\d{4})?\b/, // ZIP code
  /\b[A-Z]{2}\s+\d{5}\b/, // State + ZIP
] as const;

/**
 * Phone number patterns
 */
export const PHONE_PATTERNS = [
  /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  /\d{3}-\d{3}-\d{4}/g,
  /\(\d{3}\)\s*\d{3}-\d{4}/g,
] as const;

/**
 * Item line patterns (for itemized receipts)
 */
export const ITEM_PATTERNS = [
  /^(.+?)\s+(\d+\.?\d*)\s*$/gm, // Item name followed by price
  /^(\d+)\s+(.+?)\s+(\d+\.?\d*)\s*$/gm, // Quantity, item name, price
  /^(.+?)\s+@\s*(\d+\.?\d*)\s+(\d+\.?\d*)\s*$/gm, // Item @ unit price = total
] as const;

/**
 * Discount patterns
 */
export const DISCOUNT_PATTERNS = [
  /discount[:\s]*-?\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /coupon[:\s]*-?\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /savings?[:\s]*-?\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /promotion[:\s]*-?\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
] as const;

/**
 * Payment method patterns
 */
export const PAYMENT_PATTERNS = {
  CASH: /cash/gi,
  CREDIT: /credit|visa|mastercard|amex|discover/gi,
  DEBIT: /debit/gi,
  CHECK: /check|cheque/gi,
  GIFT_CARD: /gift\s+card/gi,
} as const;

/**
 * Utility functions for pattern matching
 */

/**
 * Extract all matches for a pattern from text
 */
export const extractMatches = (text: string, pattern: RegExp): string[] => {
  const matches: string[] = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match[1] || match[0]);
  }
  
  return matches;
};

/**
 * Find the best match from multiple patterns
 */
export const findBestMatch = (text: string, patterns: RegExp[]): string | null => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Clean and normalize extracted text
 */
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/[^\w\s.-]/g, '') // Remove special characters except .-
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Parse amount string to number
 */
export const parseAmount = (amountStr: string): number | null => {
  if (!amountStr) return null;
  
  // Remove currency symbols and spaces
  const cleaned = amountStr.replace(/[$€£¥,\s]/g, '');
  
  // Handle European format (comma as decimal separator)
  const europeanFormat = /^\d+,\d{2}$/.test(cleaned);
  if (europeanFormat) {
    const normalized = cleaned.replace(',', '.');
    const amount = parseFloat(normalized);
    return isNaN(amount) ? null : amount;
  }
  
  // Handle standard format
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
};

/**
 * Validate extracted date
 */
export const validateDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return null;
    
    // Check if date is reasonable (not in future, not too old)
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    if (date >= twoYearsAgo && date <= tomorrow) {
      return date;
    }
    
    return null;
  } catch {
    return null;
  }
};

