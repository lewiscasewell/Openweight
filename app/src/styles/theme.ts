import {DefaultTheme} from '@react-navigation/native';

export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
  success: '#22c55e',
  error: '#ef4444',
  primary: '#38bdf8',
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.black,
    primary: colors.white,
    text: colors.white,
    border: colors.black,
    notification: 'red',
    card: colors.black,
  },
};
