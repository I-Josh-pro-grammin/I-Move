// API URL - Backend hosted on Render
import { Platform } from "react-native";

export const API_URL = "https://imove-sljo.onrender.com/api";

// Map configuration - Default to Rwanda (Kigali) if location not available
export const MAP_INITIAL_REGION = {
  latitude: -1.9403, // Kigali, Rwanda
  longitude: 30.0619,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// App theme colors
export const COLORS = {
  primary: "#4361EE",
  secondary: "#3F37C9",
  accent: "#4CC9F0",
  success: "#4CAF50",
  danger: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
  light: "#F5F5F5",
  dark: "#212121",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#757575",
  lightGray: "#BDBDBD",
};
