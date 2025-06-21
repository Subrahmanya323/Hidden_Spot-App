import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors - pastel and earthy tones
    primary: '#8B7EC8', // Soft purple
    primaryVariant: '#A8A4D9',
    secondary: '#F4A6CD', // Soft pink
    secondaryVariant: '#FFB6C1',
    
    // Background colors
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F0F2F5',
    
    // Text colors
    text: '#2C3E50',
    textSecondary: '#6C757D',
    textDisabled: '#ADB5BD',
    
    // Status colors
    success: '#95D5B2', // Soft green
    warning: '#FFD93D', // Soft yellow
    error: '#F8B4B4', // Soft red
    info: '#A8D8EA', // Soft blue
    
    // Category colors
    romantic: '#F4A6CD', // Pink
    serene: '#95D5B2', // Green
    creative: '#8B7EC8', // Purple
    adventure: '#FFB347', // Orange
    food: '#FF6B6B', // Red
    other: '#A8A4D9', // Gray-purple
    
    // Map marker colors
    markerRomantic: '#E91E63',
    markerSerene: '#4CAF50',
    markerCreative: '#9C27B0',
    markerAdventure: '#FF9800',
    markerFood: '#F44336',
    markerOther: '#607D8B',
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Custom font configurations
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    // Serif font for stories
    serif: {
      fontFamily: 'Georgia',
      fontWeight: '400',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6.27,
      elevation: 10,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 10.32,
      elevation: 16,
    },
  },
};

// Gradient colors for backgrounds
export const gradients = {
  primary: ['#8B7EC8', '#A8A4D9'],
  secondary: ['#F4A6CD', '#FFB6C1'],
  background: ['#F8F9FA', '#FFFFFF'],
  card: ['#FFFFFF', '#F0F2F5'],
};

// Animation configurations
export const animations = {
  buttonPress: {
    scale: 0.95,
    duration: 150,
  },
  cardPress: {
    scale: 0.98,
    duration: 200,
  },
  fadeIn: {
    duration: 300,
  },
  slideUp: {
    duration: 400,
  },
}; 