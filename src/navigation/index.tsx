/**
 * Root Navigation Component
 * Handles the main navigation flow between authenticated and unauthenticated states
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../constants/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Loading Screen Component
 * Displayed while checking authentication state
 */
function LoadingScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

/**
 * Root Navigation Component
 * 
 * Manages the main navigation flow:
 * - Shows loading screen while checking auth state
 * - Shows AuthStack for unauthenticated users
 * - Shows AppStack for authenticated users
 */
export default function Navigation() {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication state
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {user ? (
        // User is authenticated - show main app
        <Stack.Screen
          name="Main"
          component={AppStack}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        // User is not authenticated - show auth flow
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
}

