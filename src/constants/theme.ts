/**
 * Theme configuration for the Receipt Organizer app
 * Using Material Design 3 principles with custom colors
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Color palette
export const colors = {
  // Primary colors
  primary: '#1976D2',
  primaryContainer: '#E3F2FD',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0D47A1',
  
  // Secondary colors
  secondary: '#43A047',
  secondaryContainer: '#E8F5E8',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1B5E20',
  
  // Tertiary colors
  tertiary: '#FF9800',
  tertiaryContainer: '#FFF3E0',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#E65100',
  
  // Error colors
  error: '#D32F2F',
  errorContainer: '#FFEBEE',
  onError: '#FFFFFF',
  onErrorContainer: '#B71C1C',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  onSurface: '#212121',
  onSurfaceVariant: '#757575',
  
  // Background colors
  background: '#FAFAFA',
  onBackground: '#212121',
  
  // Outline colors
  outline: '#E0E0E0',
  outlineVariant: '#F5F5F5',
  
  // Custom app colors
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Receipt status colors
  processing: '#FF9800',
  completed: '#4CAF50',
  failed: '#F44336',
  
  // Merchant category colors
  food: '#FF5722',
  groceries: '#4CAF50',
  transportation: '#2196F3',
  shopping: '#E91E63',
  entertainment: '#9C27B0',
  healthcare: '#00BCD4',
  utilities: '#607D8B',
  business: '#795548',
  other: '#9E9E9E',
} as const;

// Typography
export const typography = {
  // Display styles
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400' as const,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400' as const,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400' as const,
  },
  
  // Headline styles
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400' as const,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400' as const,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400' as const,
  },
  
  // Title styles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500' as const,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  
  // Body styles
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  
  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
} as const;

// Spacing system (8pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#1565C0',
    secondary: '#81C784',
    secondaryContainer: '#2E7D32',
    tertiary: '#FFB74D',
    tertiaryContainer: '#F57C00',
    surface: '#121212',
    background: '#000000',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
  },
};

// Default theme (light)
export const theme = lightTheme;

// Component-specific styles
export const componentStyles = {
  card: {
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  button: {
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  input: {
    borderRadius: borderRadius.sm,
    minHeight: 56,
  },
  fab: {
    borderRadius: borderRadius.full,
    ...shadows.medium,
  },
} as const;

