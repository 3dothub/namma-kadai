// Central color theme configuration
// Change these values to modify the entire app theme

export const Colors = {
  // Primary theme color
  primary: '#61a763',
  primaryDark: '#4a8a4c',
  primaryLight: '#81c783',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textOnPrimary: '#FFFFFF',
  
  // Input colors
  inputBackground: '#F8F9FA',
  inputBorder: '#E9ECEF',
  inputPlaceholder: '#B0B0B0',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Divider and border colors
  divider: '#E9ECEF',
  border: '#E9ECEF',
  
  // Social media colors
  google: '#DB4437',
  facebook: '#4267B2',
  apple: '#000000',
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
};

// Theme variants for easy switching
export const ThemeVariants = {
  green: {
    ...Colors,
    primary: '#61a763',
    primaryDark: '#4a8a4c',
    primaryLight: '#81c783',
  },
  coral: {
    ...Colors,
    primary: '#FF6B6B',
    primaryDark: '#FF4757',
    primaryLight: '#FF8E8E',
  },
  blue: {
    ...Colors,
    primary: '#3498db',
    primaryDark: '#2980b9',
    primaryLight: '#5dade2',
  },
  purple: {
    ...Colors,
    primary: '#9b59b6',
    primaryDark: '#8e44ad',
    primaryLight: '#bb8fce',
  },
};

// Current active theme (change this to switch themes)
export const currentTheme = ThemeVariants.green;
