/**
 * Firebase Configuration and Initialization
 * Sets up Firebase app with authentication, firestore, and storage
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

import { API_CONFIG } from '../constants';

// Firebase configuration
const firebaseConfig = {
  apiKey: API_CONFIG.FIREBASE_CONFIG.apiKey,
  authDomain: API_CONFIG.FIREBASE_CONFIG.authDomain,
  projectId: API_CONFIG.FIREBASE_CONFIG.projectId,
  storageBucket: API_CONFIG.FIREBASE_CONFIG.storageBucket,
  messagingSenderId: API_CONFIG.FIREBASE_CONFIG.messagingSenderId,
  appId: API_CONFIG.FIREBASE_CONFIG.appId,
};

/**
 * Initialize Firebase app
 * Prevents multiple initialization in development
 */
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Export the app instance
export default app;

/**
 * Firebase service status check
 * Useful for debugging and health checks
 */
export const getFirebaseStatus = () => {
  return {
    app: !!app,
    auth: !!auth,
    firestore: !!db,
    storage: !!storage,
    config: {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      storageBucket: firebaseConfig.storageBucket,
    },
  };
};

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Log Firebase initialization status in development
if (__DEV__) {
  console.log('Firebase initialized:', getFirebaseStatus());
  console.log('Firebase configured:', isFirebaseConfigured());
}

