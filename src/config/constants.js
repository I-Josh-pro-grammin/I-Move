// API URL - Change this to your backend server address
// Using 10.0.2.2 for Android emulator (maps to host machine's localhost)
// For physical devices, use your computer's IP address instead
import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/api'
  : 'http://localhost:8000/api';

// Map configuration
export const MAP_INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// App theme colors
export const COLORS = {
  primary: '#4361EE',
  secondary: '#3F37C9',
  accent: '#4CC9F0',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  light: '#F5F5F5',
  dark: '#212121',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#BDBDBD',
};