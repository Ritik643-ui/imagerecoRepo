/**
 * Main Application Stack Navigator
 * Handles the main app navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReceiptDetailScreen from '../screens/ReceiptDetailScreen';
import { colors, spacing } from '../constants/theme';
import type { MainTabParamList, HomeStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

/**
 * Home Stack Navigator
 * Nested stack within the Home tab for receipt detail navigation
 */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'My Receipts',
        }}
      />
      
      <HomeStack.Screen
        name="ReceiptDetail"
        component={ReceiptDetailScreen}
        options={{
          title: 'Receipt Details',
          headerBackTitle: 'Back',
        }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * Main App Stack Component
 * 
 * Bottom tab navigator for the main app functionality
 * Includes Home (with nested stack), Scan, and Settings tabs
 */
export default function AppStack() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Scan':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
          paddingBottom: spacing.xs,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false, // Headers handled by nested navigators
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Receipts',
          tabBarLabel: 'Receipts',
        }}
      />
      
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

