/**
 * Navigation type definitions for the Receipt Organizer app
 * Provides type safety for React Navigation
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

// Root navigation stack
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Main tab navigation
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Scan: undefined;
  Settings: undefined;
};

// Home stack navigation (nested in Home tab)
export type HomeStackParamList = {
  HomeScreen: undefined;
  ReceiptDetail: { receiptId: string };
};

// Auth stack navigation
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Home top tabs (for merchant filtering)
export type HomeTopTabParamList = {
  All: undefined;
  [key: string]: undefined; // Dynamic merchant tabs
};

// Screen props types for type-safe navigation
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  NativeStackScreenProps<HomeStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type HomeTopTabScreenProps<T extends keyof HomeTopTabParamList> = 
  MaterialTopTabScreenProps<HomeTopTabParamList, T>;

// Combined props for screens that need multiple navigation props
export type HomeScreenProps = HomeStackScreenProps<'HomeScreen'> & {
  tabProps: MainTabScreenProps<'Home'>;
};

export type ReceiptDetailScreenProps = HomeStackScreenProps<'ReceiptDetail'>;
export type ScanScreenProps = MainTabScreenProps<'Scan'>;
export type SettingsScreenProps = MainTabScreenProps<'Settings'>;
export type LoginScreenProps = AuthStackScreenProps<'Login'>;
export type RegisterScreenProps = AuthStackScreenProps<'Register'>;
export type ForgotPasswordScreenProps = AuthStackScreenProps<'ForgotPassword'>;

// Navigation helper types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

