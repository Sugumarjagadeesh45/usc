// D:\newapp\userapp-main 2\userapp-main\src\util\backendConfig.tsx
import axios from 'axios';
import { Platform } from 'react-native';

// Toggle this flag to switch between environments
const useLocalhost = false; // 👈 Set to true for local, false for production

// Local backend URLs
const LOCAL_BACKEND = Platform.select({
  android: 'http://10.0.2.2:5001', // Emulator
  ios: 'http://localhost:5001',     // Simulator
  default: 'http://192.168.1.100:5001', // Replace with your host IP for physical devices
});

// Live server URL
const LIVE_BACKEND = 'https://goodbackend.onrender.com';

// Current backend URL based on toggle
const API_BASE_URL = useLocalhost ? LOCAL_BACKEND : LIVE_BACKEND;

// Function to check backend availability
const checkBackendAvailability = async (url: string, timeout = 3000): Promise<boolean> => {
  try {
    const response = await axios.get(`${url}/`, { timeout });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.log(`❌ Backend ${url} is not available:`, error.message);
    return false;
  }
};

// Initialize API with the selected backend
export const initializeBackend = async () => {
  console.log('🔍 Checking backend availability...');
  
  const isLocalAvailable = useLocalhost ? await checkBackendAvailability(LOCAL_BACKEND) : false;
  const isLiveAvailable = !useLocalhost ? await checkBackendAvailability(LIVE_BACKEND) : false;
  
  if (useLocalhost && isLocalAvailable) {
    console.log('✅ Using local backend:', LOCAL_BACKEND);
  } else if (!useLocalhost && isLiveAvailable) {
    console.log('✅ Using live backend:', LIVE_BACKEND);
  } else {
    console.error('❌ Selected backend is not available');
    // Fallback to the other backend if the selected one is not available
    if (useLocalhost) {
      console.log('🔄 Trying live backend as fallback...');
      const fallbackAvailable = await checkBackendAvailability(LIVE_BACKEND);
      if (fallbackAvailable) {
        console.log('✅ Using live backend as fallback:', LIVE_BACKEND);
        return LIVE_BACKEND;
      }
    } else {
      console.log('🔄 Trying local backend as fallback...');
      const fallbackAvailable = await checkBackendAvailability(LOCAL_BACKEND);
      if (fallbackAvailable) {
        console.log('✅ Using local backend as fallback:', LOCAL_BACKEND);
        return LOCAL_BACKEND;
      }
    }
  }
  
  return API_BASE_URL;
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










// // D:\newapp\userapp-main 2\userapp-main\src\util\backendConfig.tsx
// import axios from 'axios';
// import { Platform } from 'react-native';

// // Use platform-specific backend URLs
// const LOCAL_BACKEND = Platform.select({
//   android: 'http://10.0.2.2:5001', // Emulator
//   ios: 'http://localhost:5001',     // Simulator
//   default: 'http://192.168.1.100:5001', // Replace with your host IP for physical devices
// });
// // Always use local backend
// const API_BASE_URL = LOCAL_BACKEND;

// // Function to check backend availability
// const checkBackendAvailability = async (url: string, timeout = 3000): Promise<boolean> => {
//   try {
//     const response = await axios.get(`${url}/`, { timeout });
//     return response.status >= 200 && response.status < 300;
//   } catch (error) {
//     console.log(`❌ Backend ${url} is not available:`, error.message);
//     return false;
//   }
// };

// // Initialize API with the local backend
// export const initializeBackend = async () => {
//   console.log('🔍 Checking backend availability...');
  
//   const isLocalAvailable = await checkBackendAvailability(LOCAL_BACKEND);
  
//   if (isLocalAvailable) {
//     console.log('✅ Using local backend:', LOCAL_BACKEND);
//   } else {
//     console.error('❌ Local backend is not available');
//   }
  
//   return API_BASE_URL;
// };

// // Get the current backend URL
// export const getBackendUrl = () => {
//   return API_BASE_URL;
// };
