/**
 * Authentication Context Provider
 * Manages user authentication state and operations
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../services/firebase';
import { User, AuthContextType } from '../types';
import { logAnalyticsEvent } from '../services/analytics';
import { AnalyticsEvents } from '../types';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to the entire app
 * Handles Firebase authentication and user session management
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Convert Firebase user to app user format
   */
  const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    updatedAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  });

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = convertFirebaseUser(userCredential.user);
      setUser(appUser);
      
      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.LOGIN,
        properties: {
          method: 'email',
          userId: appUser.id,
        },
        timestamp: new Date(),
        userId: appUser.id,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user with email and password
   */
  const register = async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      const appUser = convertFirebaseUser(userCredential.user);
      setUser(appUser);
      
      // Log analytics event
      await logAnalyticsEvent({
        event: AnalyticsEvents.SIGNUP,
        properties: {
          method: 'email',
          userId: appUser.id,
        },
        timestamp: new Date(),
        userId: appUser.id,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = async (): Promise<void> => {
    try {
      const currentUserId = user?.id;
      await signOut(auth);
      setUser(null);
      
      // Log analytics event
      if (currentUserId) {
        await logAnalyticsEvent({
          event: AnalyticsEvents.LOGOUT,
          properties: {
            userId: currentUserId,
          },
          timestamp: new Date(),
          userId: currentUserId,
        });
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  /**
   * Listen for authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser = convertFirebaseUser(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

