import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { ReceiptProvider } from './src/contexts/ReceiptContext';
import Navigation from './src/navigation';
import { theme } from './src/constants/theme';

/**
 * Main App Component
 * 
 * Sets up the app with all necessary providers:
 * - SafeAreaProvider for safe area handling
 * - PaperProvider for Material Design components
 * - AuthProvider for authentication state
 * - ReceiptProvider for receipt data management
 * - NavigationContainer for navigation
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <ReceiptProvider>
            <NavigationContainer>
              <Navigation />
              <StatusBar style="auto" />
            </NavigationContainer>
          </ReceiptProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

