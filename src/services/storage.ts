/**
 * Firebase Storage Service
 * Handles receipt image uploads and management
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';

import { storage } from './firebase';
import { IMAGE_CONFIG, API_CONFIG } from '../constants';

/**
 * Generate unique filename for receipt image
 */
const generateReceiptFilename = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `receipts/${userId}/${timestamp}_${random}.jpg`;
};

/**
 * Validate image file
 */
const validateImage = async (imageUri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    
    if (!fileInfo.exists) {
      throw new Error('Image file does not exist');
    }
    
    if (fileInfo.size && fileInfo.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`Image file too large. Maximum size is ${IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  } catch (error: any) {
    throw new Error(`Image validation failed: ${error.message}`);
  }
};

/**
 * Convert image URI to blob for upload
 */
const uriToBlob = async (uri: string): Promise<Blob> => {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error: any) {
    throw new Error(`Failed to convert image to blob: ${error.message}`);
  }
};

/**
 * Upload receipt image to Firebase Storage
 */
export const uploadReceiptImage = async (
  imageUri: string, 
  userId?: string
): Promise<string> => {
  try {
    // Validate image
    await validateImage(imageUri);
    
    // Generate filename
    const filename = generateReceiptFilename(userId || 'anonymous');
    
    // Create storage reference
    const storageRef = ref(storage, filename);
    
    // Convert URI to blob
    const blob = await uriToBlob(imageUri);
    
    // Set metadata
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date().toISOString(),
        originalUri: imageUri,
      },
    };
    
    // Upload file
    const uploadResult = await uploadBytes(storageRef, blob, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading receipt image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete receipt image from Firebase Storage
 */
export const deleteReceiptImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract storage path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid storage URL format');
    }
    
    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);
    
    // Delete file
    await deleteObject(storageRef);
  } catch (error: any) {
    console.error('Error deleting receipt image:', error);
    // Don't throw error for delete operations to avoid blocking other operations
    console.warn(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Get image metadata from Firebase Storage
 */
export const getImageMetadata = async (imageUrl: string): Promise<any> => {
  try {
    // Extract storage path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid storage URL format');
    }
    
    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);
    
    // Get metadata (Note: getMetadata is not available in v9 SDK for web)
    // This is a placeholder for future implementation
    return {
      path: storagePath,
      url: imageUrl,
    };
  } catch (error: any) {
    console.error('Error getting image metadata:', error);
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
};

/**
 * Resize image before upload (using Expo ImageManipulator)
 */
export const resizeImage = async (imageUri: string): Promise<string> => {
  try {
    // Import ImageManipulator dynamically to avoid issues if not available
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
    
    const manipulatedImage = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: IMAGE_CONFIG.MAX_WIDTH,
            height: IMAGE_CONFIG.MAX_HEIGHT,
          },
        },
      ],
      {
        compress: IMAGE_CONFIG.QUALITY,
        format: SaveFormat.JPEG,
      }
    );
    
    return manipulatedImage.uri;
  } catch (error: any) {
    console.warn('Image resizing failed, using original:', error.message);
    return imageUri; // Return original if resizing fails
  }
};

/**
 * Upload receipt image with automatic resizing
 */
export const uploadReceiptImageOptimized = async (
  imageUri: string,
  userId?: string
): Promise<string> => {
  try {
    // Resize image first
    const resizedUri = await resizeImage(imageUri);
    
    // Upload resized image
    return await uploadReceiptImage(resizedUri, userId);
  } catch (error: any) {
    console.error('Error uploading optimized receipt image:', error);
    throw new Error(`Failed to upload optimized image: ${error.message}`);
  }
};

/**
 * Batch upload multiple receipt images
 */
export const uploadMultipleReceiptImages = async (
  imageUris: string[],
  userId?: string
): Promise<string[]> => {
  try {
    const uploadPromises = imageUris.map(uri => 
      uploadReceiptImageOptimized(uri, userId)
    );
    
    const results = await Promise.allSettled(uploadPromises);
    const uploadedUrls: string[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        uploadedUrls.push(result.value);
      } else {
        errors.push(`Image ${index + 1}: ${result.reason.message}`);
      }
    });
    
    if (errors.length > 0) {
      console.warn('Some images failed to upload:', errors);
    }
    
    return uploadedUrls;
  } catch (error: any) {
    console.error('Error uploading multiple images:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Get storage usage for a user
 */
export const getUserStorageUsage = async (userId: string): Promise<number> => {
  // Note: Firebase Storage doesn't provide direct API for storage usage
  // This would need to be tracked separately in Firestore
  // For now, return 0 as placeholder
  return 0;
};

// TODO: Implement image compression before upload
// TODO: Add support for multiple image formats
// TODO: Implement image thumbnail generation
// TODO: Add progress tracking for uploads
// TODO: Implement offline upload queue
// TODO: Add image backup and restore functionality

