import { Platform } from 'react-native';

/**
 * Centrally managed API configuration to ensure consistent behavior 
 * across Web, Android Emulator, and Physical Devices.
 */

// If testing on a physical device, replace 'localhost' with your machine's local IP address (e.g., '192.168.1.5')
const LOCAL_HOST = 'localhost'; 
const EMULATOR_HOST = '10.0.2.2'; // Standard Android emulator loopback to host

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // Check for saved backend URL in localStorage (Electron/Web)
    try {
      const savedUrl = localStorage.getItem('BACKEND_URL');
      if (savedUrl) return savedUrl;
    } catch (e) {
      console.warn('Failed to read BACKEND_URL from localStorage', e);
    }
    return `http://${LOCAL_HOST}:5000/api`;
  }
  return `http://${EMULATOR_HOST}:5000/api`;
};

export const API_BASE_URL = getBaseUrl();

export default {
  API_BASE_URL,
};
