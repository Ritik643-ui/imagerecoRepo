/**
 * Context providers index file
 * Exports all context providers and hooks for easy importing
 */

// Auth context
export { AuthProvider, useAuth } from './AuthContext';

// Receipt context
export { ReceiptProvider, useReceipts } from './ReceiptContext';

// Combined provider component for convenience
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ReceiptProvider } from './ReceiptContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combined App Providers Component
 * 
 * Wraps all context providers in the correct order
 * Use this in App.tsx for cleaner code
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ReceiptProvider>
        {children}
      </ReceiptProvider>
    </AuthProvider>
  );
}

