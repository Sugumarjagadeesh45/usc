
import axios from 'axios';
import { Platform } from 'react-native';

// Toggle this flag to switch between environments
const useLocalhost = false;

// Local backend URLs
const LOCAL_BACKEND = Platform.select({
  android: 'http://10.0.2.2:5001', // Android emulator
  ios: 'http://localhost:5001',     // iOS simulator
  default: 'http://localhost:5001', // Default
});

// Live server URL - MAKE SURE THIS IS CORRECT
const LIVE_BACKEND = 'https://goodbackend.onrender.com';

// Current backend URL based on toggle
const API_BASE_URL = useLocalhost ? LOCAL_BACKEND : LIVE_BACKEND;

// Add this function to test backend connectivity
export const testBackendConnection = async () => {
  try {
    const backendUrl = getBackendUrl();
    console.log('Testing connection to:', backendUrl);
    
    const response = await axios.get(`${backendUrl}/api/health`, { 
      timeout: 5000 
    });
    
    console.log('Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Get the current backend URL
export const getBackendUrl = () => {
  return API_BASE_URL;
};

// Get environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    isLocalhost: useLocalhost,
    currentBackend: API_BASE_URL,
    localBackend: LOCAL_BACKEND,
    liveBackend: LIVE_BACKEND,
    environmentName: useLocalhost ? 'Local Development' : 'Production',
  };
};