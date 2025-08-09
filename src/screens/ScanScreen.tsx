/**
 * Scan Screen Component
 * Handles receipt scanning via camera or gallery selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Text, Button, Card, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useReceipts } from '../contexts/ReceiptContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { processReceiptImage } from '../services/ocr';
import { uploadReceiptImage } from '../services/storage';
import { logAnalyticsEvent } from '../services/analytics';
import { AnalyticsEvents, ReceiptStatus } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';
import { ERROR_MESSAGES } from '../constants';
import type { ScanScreenProps } from '../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ScanScreen Component
 * 
 * Provides camera interface for scanning receipts
 * Also allows selecting images from gallery
 * Processes images with OCR and saves receipts
 */
export default function ScanScreen({ navigation }: ScanScreenProps) {
  const { addReceipt } = useReceipts();
  const cameraRef = useRef<Camera>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  /**
   * Request camera permissions
   */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  /**
   * Handle camera capture
   */
  const handleCameraCapture = async () => {
    if (!cameraRef.current) return;

    try {
      setProcessing(true);
      setError('');

      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.SCAN_START,
        properties: { method: 'camera' },
        timestamp: new Date(),
      });

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      await processImage(photo.uri);
    } catch (err: any) {
      console.error('Camera capture error:', err);
      setError('Failed to capture image. Please try again.');
      
      await logAnalyticsEvent({
        event: AnalyticsEvents.SCAN_ERROR,
        properties: { 
          method: 'camera',
          error: err.message 
        },
        timestamp: new Date(),
      });
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Handle gallery selection
   */
  const handleGallerySelect = async () => {
    try {
      setProcessing(true);
      setError('');

      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError(ERROR_MESSAGES.GALLERY_PERMISSION);
        return;
      }

      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.SCAN_START,
        properties: { method: 'gallery' },
        timestamp: new Date(),
      });

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error('Gallery selection error:', err);
      setError('Failed to select image. Please try again.');
      
      await logAnalyticsEvent({
        event: AnalyticsEvents.SCAN_ERROR,
        properties: { 
          method: 'gallery',
          error: err.message 
        },
        timestamp: new Date(),
      });
    } finally {
      setProcessing(false);
      setShowOptions(false);
    }
  };

  /**
   * Process captured/selected image
   */
  const processImage = async (imageUri: string) => {
    try {
      // Upload image to storage
      const imageUrl = await uploadReceiptImage(imageUri);
      
      // Process with OCR
      const parsedReceipt = await processReceiptImage(imageUrl);
      
      // Save receipt
      const receipt = await addReceipt({
        merchant: parsedReceipt.merchant,
        purchaseDate: parsedReceipt.purchaseDate,
        subtotal: parsedReceipt.subtotal,
        tax: parsedReceipt.tax,
        total: parsedReceipt.total,
        currency: parsedReceipt.currency,
        imageUrl,
        rawText: parsedReceipt.fields.rawText || '',
      });

      // Log success
      await logAnalyticsEvent({
        event: AnalyticsEvents.SCAN_SUCCESS,
        properties: {
          merchant: receipt.merchant,
          total: receipt.total,
          confidence: parsedReceipt.confidence,
        },
        timestamp: new Date(),
      });

      // Navigate to receipt detail
      navigation.navigate('Home', {
        screen: 'ReceiptDetail',
        params: { receiptId: receipt.id },
      });
    } catch (err: any) {
      console.error('Image processing error:', err);
      setError(err.message || 'Failed to process receipt. Please try again.');
      
      await logAnalyticsEvent({
        event: AnalyticsEvents.SCAN_ERROR,
        properties: { 
          error: err.message,
          stage: 'processing'
        },
        timestamp: new Date(),
      });
    }
  };

  /**
   * Toggle camera type
   */
  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  /**
   * Toggle flash mode
   */
  const toggleFlashMode = () => {
    setFlashMode(current => {
      switch (current) {
        case FlashMode.off:
          return FlashMode.on;
        case FlashMode.on:
          return FlashMode.auto;
        case FlashMode.auto:
          return FlashMode.off;
        default:
          return FlashMode.off;
      }
    });
  };

  /**
   * Get flash icon name
   */
  const getFlashIcon = () => {
    switch (flashMode) {
      case FlashMode.on:
        return 'flash';
      case FlashMode.auto:
        return 'flash-outline';
      default:
        return 'flash-off';
    }
  };

  /**
   * Show options modal
   */
  const handleOptionsPress = () => {
    setShowOptions(true);
  };

  if (hasPermission === null) {
    return <LoadingSpinner message="Requesting camera permission..." />;
  }

  if (hasPermission === false) {
    return (
      <ErrorMessage
        message={ERROR_MESSAGES.CAMERA_PERMISSION}
        onRetry={() => {
          Camera.requestCameraPermissionsAsync().then(({ status }) => {
            setHasPermission(status === 'granted');
          });
        }}
        retryText="Grant Permission"
      />
    );
  }

  if (processing) {
    return <LoadingSpinner message="Processing receipt..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => setError('')}
        retryText="Try Again"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
      >
        {/* Camera overlay */}
        <View style={styles.overlay}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <Button
              mode="contained-tonal"
              onPress={toggleFlashMode}
              icon={getFlashIcon()}
              style={styles.controlButton}
            >
              Flash
            </Button>
            
            <Button
              mode="contained-tonal"
              onPress={toggleCameraType}
              icon="camera-flip"
              style={styles.controlButton}
            >
              Flip
            </Button>
          </View>

          {/* Scan area indicator */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              Position receipt within the frame
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <Button
              mode="contained-tonal"
              onPress={handleOptionsPress}
              icon="image"
              style={styles.galleryButton}
            >
              Gallery
            </Button>
            
            <Button
              mode="contained"
              onPress={handleCameraCapture}
              icon="camera"
              style={styles.captureButton}
              contentStyle={styles.captureButtonContent}
            >
              Capture
            </Button>
            
            <View style={styles.placeholder} />
          </View>
        </View>
      </Camera>

      {/* Options Modal */}
      <Portal>
        <Modal
          visible={showOptions}
          onDismiss={() => setShowOptions(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Card>
            <Card.Content>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Select Image Source
              </Text>
              
              <Button
                mode="contained"
                onPress={() => {
                  setShowOptions(false);
                  // Small delay to allow modal to close
                  setTimeout(handleCameraCapture, 100);
                }}
                icon="camera"
                style={styles.modalButton}
              >
                Take Photo
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleGallerySelect}
                icon="image"
                style={styles.modalButton}
              >
                Choose from Gallery
              </Button>
              
              <Button
                mode="text"
                onPress={() => setShowOptions(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  scanFrame: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.6,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: colors.onPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  galleryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    backgroundColor: colors.primary,
  },
  captureButtonContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  placeholder: {
    width: 80, // Same width as gallery button for centering
  },
  modalContent: {
    margin: spacing.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.onSurface,
  },
  modalButton: {
    marginBottom: spacing.sm,
  },
});

