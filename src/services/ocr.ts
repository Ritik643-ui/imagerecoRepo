/**
 * OCR Service using Google Cloud Vision API
 * Extracts text from receipt images
 */

import { API_CONFIG, DEFAULTS } from '../constants';
import { OCRResult, ParsedReceipt } from '../types';
import { parseReceiptText } from './parser';

/**
 * Google Cloud Vision API request structure
 */
interface VisionAPIRequest {
  requests: Array<{
    image: {
      source: {
        imageUri: string;
      };
    };
    features: Array<{
      type: string;
      maxResults: number;
    }>;
  }>;
}

/**
 * Google Cloud Vision API response structure
 */
interface VisionAPIResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

/**
 * Extract text from image using Google Cloud Vision API
 */
export const extractTextFromImage = async (imageUrl: string): Promise<OCRResult> => {
  try {
    if (!API_CONFIG.GOOGLE_CLOUD_VISION_API_KEY) {
      throw new Error('Google Cloud Vision API key not configured');
    }

    const requestBody: VisionAPIRequest = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl,
            },
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `${API_CONFIG.GOOGLE_CLOUD_VISION_URL}?key=${API_CONFIG.GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        timeout: API_CONFIG.OCR_TIMEOUT,
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API request failed: ${response.status} ${response.statusText}`);
    }

    const data: VisionAPIResponse = await response.json();
    
    if (!data.responses || data.responses.length === 0) {
      throw new Error('No response from Vision API');
    }

    const visionResponse = data.responses[0];
    
    if (visionResponse.error) {
      throw new Error(`Vision API error: ${visionResponse.error.message}`);
    }

    // Extract text from response
    let extractedText = '';
    let confidence = 0;

    if (visionResponse.fullTextAnnotation) {
      extractedText = visionResponse.fullTextAnnotation.text;
      confidence = 0.9; // Default confidence for full text annotation
    } else if (visionResponse.textAnnotations && visionResponse.textAnnotations.length > 0) {
      extractedText = visionResponse.textAnnotations[0].description;
      confidence = 0.8; // Slightly lower confidence for text annotations
    }

    if (!extractedText.trim()) {
      throw new Error('No text detected in image');
    }

    return {
      text: extractedText,
      confidence,
      boundingBoxes: extractBoundingBoxes(visionResponse.textAnnotations || []),
    };
  } catch (error: any) {
    console.error('OCR extraction error:', error);
    
    // Handle specific error cases
    if (error.message.includes('quota')) {
      throw new Error('OCR service quota exceeded. Please try again later.');
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Extract bounding boxes from Vision API text annotations
 */
const extractBoundingBoxes = (textAnnotations: any[]) => {
  return textAnnotations.slice(1).map((annotation) => {
    const vertices = annotation.boundingPoly?.vertices || [];
    
    if (vertices.length < 4) {
      return null;
    }

    const xs = vertices.map((v: any) => v.x || 0);
    const ys = vertices.map((v: any) => v.y || 0);
    
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      text: annotation.description || '',
    };
  }).filter(Boolean);
};

/**
 * Process receipt image with OCR and parsing
 */
export const processReceiptImage = async (imageUrl: string): Promise<ParsedReceipt> => {
  try {
    // Extract text using OCR
    const ocrResult = await extractTextFromImage(imageUrl);
    
    // Parse the extracted text
    const parsedReceipt = parseReceiptText(ocrResult.text);
    
    // Combine OCR confidence with parsing confidence
    const combinedConfidence = (ocrResult.confidence + parsedReceipt.confidence) / 2;
    
    return {
      ...parsedReceipt,
      confidence: combinedConfidence,
      fields: {
        ...parsedReceipt.fields,
        rawText: ocrResult.text,
        ocrConfidence: ocrResult.confidence.toString(),
        boundingBoxCount: ocrResult.boundingBoxes?.length.toString() || '0',
      },
    };
  } catch (error: any) {
    console.error('Receipt processing error:', error);
    throw new Error(`Failed to process receipt: ${error.message}`);
  }
};

/**
 * Retry OCR extraction with exponential backoff
 */
export const extractTextWithRetry = async (
  imageUrl: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<OCRResult> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await extractTextFromImage(imageUrl);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('quota') || error.message.includes('API key')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`OCR attempt ${attempt} failed, retrying in ${delay}ms...`);
    }
  }
  
  throw lastError;
};

/**
 * Validate OCR result quality
 */
export const validateOCRResult = (ocrResult: OCRResult): boolean => {
  // Check minimum confidence threshold
  if (ocrResult.confidence < DEFAULTS.CONFIDENCE_THRESHOLD) {
    return false;
  }
  
  // Check minimum text length
  if (ocrResult.text.trim().length < 10) {
    return false;
  }
  
  // Check for common receipt indicators
  const receiptIndicators = [
    'total', 'subtotal', 'tax', 'amount', 'receipt', 'store', 'date',
    '$', 'USD', 'CAD', 'EUR', 'GBP', 'thank you', 'visit'
  ];
  
  const textLower = ocrResult.text.toLowerCase();
  const foundIndicators = receiptIndicators.filter(indicator => 
    textLower.includes(indicator)
  );
  
  // Require at least 2 receipt indicators
  return foundIndicators.length >= 2;
};

/**
 * Get OCR service status and usage
 */
export const getOCRServiceStatus = () => {
  return {
    configured: !!API_CONFIG.GOOGLE_CLOUD_VISION_API_KEY,
    apiUrl: API_CONFIG.GOOGLE_CLOUD_VISION_URL,
    timeout: API_CONFIG.OCR_TIMEOUT,
    confidenceThreshold: DEFAULTS.CONFIDENCE_THRESHOLD,
  };
};

// TODO: Implement offline OCR fallback using device capabilities
// TODO: Add support for multiple OCR providers (AWS Textract, Azure Computer Vision)
// TODO: Implement OCR result caching to avoid re-processing same images
// TODO: Add support for different image formats and preprocessing
// TODO: Implement batch OCR processing for multiple images
// TODO: Add OCR accuracy metrics and reporting

