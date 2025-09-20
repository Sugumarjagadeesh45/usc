// Screen1.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ScrollView 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Menu from './Screen1/Menuicon/Menu';
import TaxiContent from './Screen1/Taxibooking/TaxiContent';
import ShoppingContent from './Screen1/Shopping/ShoppingContent';
import Notifications from './Screen1/Bellicon/Notifications';
import { getBackendUrl } from './util/backendConfig';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  category: string;
}

interface Category {
  id: string;
  name: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface UserData {
  name: string;
  phoneNumber: string;
  customerId: string;
  profilePicture?: string;
}

const mockProducts: Product[] = [
  { 
    id: '1', 
    name: 'Smartphone', 
    description: 'Latest model smartphone with great camera', 
    price: 699.99, 
    originalPrice: 799.99,
    discount: 12, 
    images: ['https://via.placeholder.com/150'],
    category: 'Electronics'
  },
  { 
    id: '2', 
    name: 'Headphones', 
    description: 'Wireless noise-canceling headphones', 
    price: 199.99, 
    originalPrice: 249.99,
    discount: 20, 
    images: ['https://via.placeholder.com/150'],
    category: 'Electronics'
  },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Home' },
  { id: '4', name: 'Books' },
];

export default function Screen1() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [activeTab, setActiveTab] = useState<'taxi' | 'shopping'>('taxi');
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [lastSavedLocation, setLastSavedLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(route.params?.phone || '');
  const [showRegistrationModal, setShowRegistrationModal] = useState(route.params?.isNewUser || false);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    phoneNumber: '',
    customerId: '',
    profilePicture: '',
  });
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [backendUrls, setBackendUrls] = useState<Record<string, string>>({});

  const getBackendUrls = () => {
    const baseUrl = getBackendUrl();
    return {
      register: `${baseUrl}/api/auth/register`,
      profile: `${baseUrl}/api/users/profile`,
      me: `${baseUrl}/api/users/me`,
      meProfile: `${baseUrl}/api/users/me/profile`,
      location: `${baseUrl}/api/users/location`,
      logout: `${baseUrl}/api/auth/logout`,
    };
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs access to your location to provide taxi services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const fetchUserData = useCallback(async () => {
    try {
      setLoadingUserData(true);
      const urls = getBackendUrls();
      setBackendUrls(urls);

      let token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('userToken');
      if (!token) {
        const phoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (phoneNumber) {
          const response = await axios.post(urls.register.replace('register', 'verify-phone'), { phoneNumber });
          if (response.data.success && response.data.newUser) {
            setShowRegistrationModal(true);
            setPhoneNumber(phoneNumber);
            return;
          } else if (response.data.success && response.data.token) {
            token = response.data.token;
            await AsyncStorage.setItem('authToken', token);
          }
        }
      }

      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen3' }] });
        return;
      }

      const response = await axios.get(urls.meProfile, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const { name, phoneNumber, customerId, profilePicture } = response.data.user;
      setUserData({ name, phoneNumber, customerId, profilePicture });
    } catch (error: any) {
      console.error('Error fetching user data:', error.message, error.response?.data);
      if (error.response?.status === 401) {
        await AsyncStorage.multiRemove(['authToken', 'userToken']);
        navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen3' }] });
      } else {
        Alert.alert('Error', 'Failed to load user data. Please try again.');
      }
    } finally {
      setLoadingUserData(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData]),
  );

  useEffect(() => {
    if (route.params?.refresh) {
      fetchUserData();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh, fetchUserData]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (menuVisible && !loadingUserData && !userData.name) {
      timeoutId = setTimeout(() => {
        fetchUserData();
      }, 100);
    } else if (!menuVisible) {
      setLoadingUserData(false);
    }
    return () => clearTimeout(timeoutId);
  }, [menuVisible, loadingUserData, userData.name, fetchUserData]);

  const handlePickupChange = (text: string) => {
    setPickup(text);
  };

  const handleDropoffChange = (text: string) => {
    setDropoff(text);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    setNotificationsVisible(false);
  };

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
    setMenuVisible(false);
  };

  const handleLogout = async () => {
    try {
      setMenuVisible(false);
      await auth().signOut();
      await AsyncStorage.multiRemove([
        'authToken',
        'userToken',
        'isRegistered',
        'name',
        'address',
        'phoneNumber',
        'customerId',
        'profilePicture',
      ]);
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen3' }],
      });
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'electronics':
        return 'devices';
      case 'clothing':
        return 'checkroom';
      case 'home':
        return 'home';
      case 'books':
        return 'menu-book';
      default:
        return 'shopping-cart';
    }
  };

  const handleSubmitRegistration = async () => {
    if (!name || !address || !phoneNumber) {
      Alert.alert('Error', 'Name, address, and phone number are required');
      return;
    }
    setLoadingRegistration(true);
    try {
      const userData = { name, address, phoneNumber };
      const urls = getBackendUrls();
      const response = await axios.post(urls.register, userData);
      if (response.data.success && response.data.token) {
        await AsyncStorage.multiSet([
          ['authToken', response.data.token],
          ['isRegistered', 'true'],
          ['name', name],
          ['address', address],
          ['phoneNumber', phoneNumber],
        ]);
        setShowRegistrationModal(false);
        await fetchUserData();
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoadingRegistration(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }

      const options: any = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      };

      if (Platform.OS === 'ios') {
        options.showLocationDialog = true;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(coords);
          setPickup('My Current Location');
          try {
            const urls = getBackendUrls();
            const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('userToken');
            await axios.post(urls.location, coords, {
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
          } catch (err: any) {
            console.log('Error sending location:', err.message);
          }
        },
        (error) => {
          console.log('Location Error:', error.message);
          fetchLastLocation();
        },
        options,
      );
    } catch (error) {
      console.log('Error in getCurrentLocation:', error);
    }
  };

  const fetchLastLocation = async () => {
    try {
      const urls = getBackendUrls();
      const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('userToken');
      if (!token) {
        return;
      }
      const res = await axios.get(urls.location + '/last', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const location = res.data.location || res.data;
      setLastSavedLocation(location);
      if (!currentLocation) {
        setCurrentLocation(location);
        setPickup('Last Known Location');
      }
    } catch (err: any) {
      console.log('Error fetching last location:', err.message);
      if (err.response?.status === 401) {
        await AsyncStorage.multiRemove(['authToken', 'userToken']);
        await fetchUserData();
      }
    }
  };

  useEffect(() => {
    if (Object.keys(backendUrls).length > 0) {
      getCurrentLocation();
      fetchLastLocation();
    }
  }, [backendUrls]);

  const addToCart = (product: Product) => {
    Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
  };

return (
  <LinearGradient
    colors={['#f0fff0', '#ccffcc']}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.header}>
      {/* Header content remains the same */}
      <TouchableOpacity onPress={toggleMenu}>
        <MaterialIcons name="menu" size={24} color="#333333" />
      </TouchableOpacity>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'taxi' && styles.activeTab]}
          onPress={() => setActiveTab('taxi')}
        >
          <FontAwesome name="taxi" size={20} color={activeTab === 'taxi' ? '#ffffff' : '#4caf50'} />
          <Text style={[styles.tabText, activeTab === 'taxi' && styles.activeTabText]}>Taxi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'shopping' && styles.activeTab]}
          onPress={() => setActiveTab('shopping')}
        >
          <MaterialIcons name="shopping-cart" size={20} color={activeTab === 'shopping' ? '#ffffff' : '#4caf50'} />
          <Text style={[styles.tabText, activeTab === 'shopping' && styles.activeTabText]}>Shopping</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={toggleNotifications}>
        <MaterialIcons name="notifications" size={24} color="#333333" />
      </TouchableOpacity>
    </View>

    {/* Wrap the main content in a ScrollView */}
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {activeTab === 'taxi' ? (
        <TaxiContent
          loadingLocation={loadingLocation}
          currentLocation={currentLocation}
          lastSavedLocation={lastSavedLocation}
          pickup={pickup}
          dropoff={dropoff}
          handlePickupChange={handlePickupChange}
          handleDropoffChange={handleDropoffChange}
        />
      ) : (
        <ShoppingContent
          products={mockProducts}
          categories={mockCategories}
          getCategoryIcon={getCategoryIcon}
          addToCart={addToCart}
        />
      )}
    </ScrollView>

    {/* These components should stay outside the ScrollView */}
    {menuVisible && (
      <View style={styles.overlay}>
        {loadingUserData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4caf50" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <Menu
            name={userData.name}
            phoneNumber={userData.phoneNumber}
            profilePicture={userData.profilePicture}
            customerId={userData.customerId}
            toggleMenu={toggleMenu}
            handleLogout={handleLogout}
          />
        )}
      </View>
    )}

    {notificationsVisible && (
      <View style={styles.overlay}>
        <Notifications toggleNotifications={toggleNotifications} />
      </View>
    )}

    <Modal visible={showRegistrationModal} transparent animationType="fade">
      <View style={styles.registrationModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Complete Your Registration</Text>
          <Text style={styles.modalText}>Please provide your details to continue.</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#666666"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#666666"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitRegistration}
            disabled={loadingRegistration}
          >
            {loadingRegistration ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </LinearGradient>
);
}

const styles = StyleSheet.create({
    scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some bottom padding
  },


  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 5,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  activeTab: { backgroundColor: '#4caf50' },
  tabText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#4caf50' },
  activeTabText: { color: '#ffffff' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  registrationModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: width * 0.8,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333333' },
  modalText: { fontSize: 14, color: '#666666', marginBottom: 20, textAlign: 'center' },
  modalInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    width: '100%',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: {
    width: '75%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
});





// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Alert,
//   ActivityIndicator,
//   TextInput,
//   Dimensions,
//   Platform,
//   PermissionsAndroid,
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import auth from '@react-native-firebase/auth';
// import Geolocation from '@react-native-community/geolocation';
// import axios from 'axios';
// import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
// import Menu from './Screen1/Menuicon/Menu';
// import TaxiContent from './Screen1/Taxibooking/TaxiContent';
// import ShoppingContent from './Screen1/Shopping/ShoppingContent';
// import Notifications from './Screen1/Bellicon/Notifications';
// import { getBackendUrl } from './util/backendConfig';

// // Screen width
// const { width } = Dimensions.get('window');

// // Interfaces
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
// }
// interface Category {
//   id: string;
//   name: string;
// }
// interface Location {
//   latitude: number;
//   longitude: number;
// }
// interface UserData {
//   name: string;
//   phoneNumber: string;
//   customerId: string;
//   profilePicture?: string;
// }

// const mockProducts: Product[] = [
//   { id: '1', name: 'Smartphone', description: 'Latest model smartphone with great camera', price: 699.99, image: 'https://via.placeholder.com/150' },
//   { id: '2', name: 'Headphones', description: 'Wireless noise-canceling headphones', price: 199.99, image: 'https://via.placeholder.com/150' },
// ];
// const mockCategories: Category[] = [
//   { id: '1', name: 'Electronics' },
//   { id: '2', name: 'Clothing' },
//   { id: '3', name: 'Home' },
//   { id: '4', name: 'Books' },
// ];
// const dropoffSuggestions = [
//   { id: '1', name: 'Downtown Mall' },
//   { id: '2', name: 'Central Railway Station' },
//   { id: '3', name: 'City Park' },
//   { id: '4', name: 'Main Hospital' },
// ];

// export default function Screen1() {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();


//     const [cart, setCart] = useState<any[]>([]);


//   // State Management
//   const [activeTab, setActiveTab] = useState<'taxi' | 'shopping'>('taxi');
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [notificationsVisible, setNotificationsVisible] = useState(false);
//   const [pickup, setPickup] = useState('');
//   const [dropoff, setDropoff] = useState('');
//   const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
//   const [selectedRideType, setSelectedRideType] = useState<string>('taxi');
//   const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
//   const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
//   const [lastSavedLocation, setLastSavedLocation] = useState<Location | null>(null);
//   const [loadingLocation, setLoadingLocation] = useState(false);
//   const [name, setName] = useState('');
//   const [address, setAddress] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState(route.params?.phone || '');
//   const [showRegistrationModal, setShowRegistrationModal] = useState(route.params?.isNewUser || false);
//   const [loadingRegistration, setLoadingRegistration] = useState(false);
//   const [selectingPickup, setSelectingPickup] = useState(false);
//   const [selectingDropoff, setSelectingDropoff] = useState(false);

//   // User data state
//   const [userData, setUserData] = useState<UserData>({
//     name: '',
//     phoneNumber: '',
//     customerId: '',
//     profilePicture: '',
//   });



//     const addToCart = (product: any) => {
//     setCart(prevCart => [...prevCart, product]);
//   };


//   // Loading state for user data
//   const [loadingUserData, setLoadingUserData] = useState(true);

//   // Backend URLs state
//   const [backendUrls, setBackendUrls] = useState<Record<string, string>>({});

//   // Auto-detect base URL for backend
//   const getBackendUrls = () => {
//     const baseUrl = getBackendUrl();
//     return {
//       register: `${baseUrl}/api/auth/register`,
//       profile: `${baseUrl}/api/users/profile`,
//       me: `${baseUrl}/api/users/me`,
//       meProfile: `${baseUrl}/api/users/me/profile`,
//       location: `${baseUrl}/api/users/location`,
//       logout: `${baseUrl}/api/auth/logout`,
//     };
//   };

//   // Request location permission for Android
//   const requestLocationPermission = async (): Promise<boolean> => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Access Required',
//             message: 'This app needs access to your location to provide taxi services.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn('Permission request error:', err);
//         return false;
//       }
//     }
//     return true;
//   };

//   const fetchUserData = useCallback(async () => {
//     try {
//       setLoadingUserData(true);
//       console.log('🔄 Starting to fetch user data');

//       const urls = getBackendUrls();
//       setBackendUrls(urls);

//       let token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('userToken');
//       console.log('🔑 Token found:', token ? 'Yes' : 'No');

//       if (!token) {
//         const phoneNumber = await AsyncStorage.getItem('phoneNumber');
//         if (phoneNumber) {
//           const response = await axios.post(urls.register.replace('register', 'verify-phone'), { phoneNumber });
//           if (response.data.success && response.data.newUser) {
//             setShowRegistrationModal(true);
//             setPhoneNumber(phoneNumber);
//             return;
//           } else if (response.data.success && response.data.token) {
//             token = response.data.token;
//             await AsyncStorage.setItem('authToken', token);
//           }
//         }
//       }

//       if (!token) {
//         console.log('❌ No valid token, redirecting to login');
//         navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen3' }] });
//         return;
//       }

//       const response = await axios.get(urls.meProfile, {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 10000,
//       });
//       const { name, phoneNumber, customerId, profilePicture } = response.data.user;
//       setUserData({ name, phoneNumber, customerId, profilePicture });
//       console.log('✅ User data fetched:', { name, phoneNumber, customerId, profilePicture });
//     } catch (error: any) {
//       console.error('❌ Error fetching user data:', error.message, error.response?.data);
//       if (error.response?.status === 401) {
//         await AsyncStorage.multiRemove(['authToken', 'userToken']);
//         navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen3' }] });
//       } else {
//         Alert.alert('Error', 'Failed to load user data. Please try again.');
//       }
//     } finally {
//       setLoadingUserData(false);
//     }
//   }, [navigation]);

//   // Focus effect to fetch data when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchUserData();
//     }, [fetchUserData]),
//   );

//   // Effect to handle refresh parameter
//   useEffect(() => {
//     if (route.params?.refresh) {
//       fetchUserData();
//       navigation.setParams({ refresh: false });
//     }
//   }, [route.params?.refresh, fetchUserData]);

//   // Optimized effect for menu visibility to reduce blinking
//   useEffect(() => {
//     let timeoutId: NodeJS.Timeout;
//     if (menuVisible && !loadingUserData && !userData.name) {
//       timeoutId = setTimeout(() => {
//         fetchUserData();
//       }, 100); // Delay fetch to debounce rapid toggles
//     } else if (!menuVisible) {
//       setLoadingUserData(false);
//     }
//     return () => clearTimeout(timeoutId); // Cleanup timeout
//   }, [menuVisible, loadingUserData, userData.name, fetchUserData]);

//   // Handlers
//   const handlePickupChange = (text: string) => {
//     setPickup(text);
//     setSelectingPickup(false);
//   };

//   const handleDropoffChange = (text: string) => {
//     setDropoff(text);
//     setSelectingDropoff(false);
//     if (text.length > 2) {
//       setSuggestions([
//         { id: '1', name: `${text} Street` },
//         { id: '2', name: `${text} Mall` },
//         { id: '3', name: `${text} Center` },
//       ]);
//       setShowDropoffSuggestions(true);
//     } else {
//       setShowDropoffSuggestions(false);
//     }
//   };

//   const selectSuggestion = (suggestion: { id: string; name: string }) => {
//     setDropoff(suggestion.name);
//     setShowDropoffSuggestions(false);
//     setSelectingDropoff(false);
//   };

//   const toggleMenu = () => {
//     setMenuVisible(!menuVisible);
//     setNotificationsVisible(false);
//   };

//   const toggleNotifications = () => {
//     setNotificationsVisible(!notificationsVisible);
//     setMenuVisible(false);
//   };

//   const handleLogout = async () => {
//     try {
//       setMenuVisible(false);

//       // Sign out from Firebase
//       await auth().signOut();

//       // Clear all authentication data from AsyncStorage
//       await AsyncStorage.multiRemove([
//         'authToken',
//         'userToken',
//         'isRegistered',
//         'name',
//         'address',
//         'phoneNumber',
//         'customerId',
//         'profilePicture',
//       ]);

//       // Navigate to WelcomeScreen3
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'WelcomeScreen3' }],
//       });
//     } catch (err) {
//       console.error('Logout error:', err);
//       Alert.alert('Error', 'Failed to log out. Please try again.');
//     }
//   };

//   const getCategoryIcon = (categoryName: string) => {
//     switch (categoryName.toLowerCase()) {
//       case 'electronics':
//         return 'devices';
//       case 'clothing':
//         return 'checkroom';
//       case 'home':
//         return 'home';
//       case 'books':
//         return 'menu-book';
//       default:
//         return 'shopping-cart';
//     }
//   };

//   const handleSubmitRegistration = async () => {
//     if (!name || !address || !phoneNumber) {
//       Alert.alert('Error', 'Name, address, and phone number are required');
//       return;
//     }
//     setLoadingRegistration(true);
//     try {
//       const userData = { name, address, phoneNumber };
//       const urls = getBackendUrls();

//       const response = await axios.post(urls.register, userData);
//       if (response.data.success && response.data.token) {
//         await AsyncStorage.multiSet([
//           ['authToken', response.data.token],
//           ['isRegistered', 'true'],
//           ['name', name],
//           ['address', address],
//           ['phoneNumber', phoneNumber],
//         ]);
//         setShowRegistrationModal(false);
//         await fetchUserData(); // Refresh user data
//       } else {
//         throw new Error(response.data.error || 'Registration failed');
//       }
//     } catch (error: any) {
//       console.error('Registration error:', error.response?.data || error.message);
//       Alert.alert('Error', error.response?.data?.error || 'Failed to register. Please try again.');
//     } finally {
//       setLoadingRegistration(false);
//     }
//   };

//   // Get current location - simplified version
//   const getCurrentLocation = async () => {
//     try {
//       const hasPermission = await requestLocationPermission();
//       if (!hasPermission) {
//         console.log('❌ Location permission denied');
//         return;
//       }

//       const options: any = {
//         enableHighAccuracy: false,
//         timeout: 10000,
//         maximumAge: 300000,
//       };

//       if (Platform.OS === 'ios') {
//         options.showLocationDialog = true;
//       }

//       Geolocation.getCurrentPosition(
//         async (position) => {
//           const coords = {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           };
//           console.log('📍 App open location:', coords);
//           setCurrentLocation(coords);
//           setPickup('My Current Location');

//           try {
//             const urls = getBackendUrls();
//             const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('userToken');

//             await axios.post(urls.location, coords, {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//               },
//             });
//             console.log('✅ Location sent to backend successfully');
//           } catch (err: any) {
//             console.log('❌ Error sending location:', err.message);
//           }
//         },
//         (error) => {
//           console.log('❌ Location Error:', error.message);
//           fetchLastLocation();
//         },
//         options,
//       );
//     } catch (error) {
//       console.log('❌ Error in getCurrentLocation:', error);
//     }
//   };

//   // Fetch last location - simplified version
//   const fetchLastLocation = async () => {
//     try {
//       const urls = getBackendUrls();
//       const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('userToken');

//       if (!token) {
//         console.log('❌ No token for last location fetch, skipping...');
//         return;
//       }

//       const res = await axios.get(urls.location + '/last', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       const location = res.data.location || res.data;
//       setLastSavedLocation(location);
//       if (!currentLocation) {
//         setCurrentLocation(location);
//         setPickup('Last Known Location');
//       }
//       console.log('📍 App open last location:', location);
//     } catch (err: any) {
//       console.log('❌ Error fetching last location:', err.message);
//       if (err.response?.status === 401) {
//         await AsyncStorage.multiRemove(['authToken', 'userToken']);
//         await fetchUserData();
//       }
//     }
//   };

//   // Effect for location-related functions
//   useEffect(() => {
//     if (Object.keys(backendUrls).length > 0) {
//       getCurrentLocation();
//       fetchLastLocation();
//     }
//   }, [backendUrls]);

//   return (
//     <LinearGradient
//       colors={['#f0fff0', '#ccffcc']}
//       style={styles.container}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={toggleMenu}>
//           <MaterialIcons name="menu" size={24} color="#333333" />
//         </TouchableOpacity>
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'taxi' && styles.activeTab]}
//             onPress={() => setActiveTab('taxi')}
//           >
//             <FontAwesome name="taxi" size={20} color={activeTab === 'taxi' ? '#ffffff' : '#4caf50'} />
//             <Text style={[styles.tabText, activeTab === 'taxi' && styles.activeTabText]}>Taxi</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'shopping' && styles.activeTab]}
//             onPress={() => setActiveTab('shopping')}
//           >
//             <MaterialIcons name="shopping-cart" size={20} color={activeTab === 'shopping' ? '#ffffff' : '#4caf50'} />
//             <Text style={[styles.tabText, activeTab === 'shopping' && styles.activeTabText]}>Shopping</Text>
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity onPress={toggleNotifications}>
//           <MaterialIcons name="notifications" size={24} color="#333333" />
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//      {activeTab === 'taxi' ? (
//         <TaxiContent
//           loadingLocation={loadingLocation}
//           currentLocation={currentLocation}
//           lastSavedLocation={lastSavedLocation}
//           pickup={pickup}
//           dropoff={dropoff}
//           handlePickupChange={handlePickupChange}
//           handleDropoffChange={handleDropoffChange}
//         />
//       ) : (
//         <ShoppingContent
//           categories={mockCategories}
//           products={mockProducts}
//           addToCart={addToCart}
//         />
//       )}

//       {/* Overlay */}
//       {menuVisible && (
//         <View style={styles.overlay}>
//           {loadingUserData ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#4caf50" />
//               <Text style={styles.loadingText}>Loading profile...</Text>
//             </View>
//           ) : (
//             <Menu
//               name={userData.name}
//               phoneNumber={userData.phoneNumber}
//               profilePicture={userData.profilePicture}
//               customerId={userData.customerId}
//               toggleMenu={toggleMenu}
//               handleLogout={handleLogout}
//             />
//           )}
//         </View>
//       )}

//       {notificationsVisible && (
//         <View style={styles.overlay}>
//           <Notifications toggleNotifications={toggleNotifications} />
//         </View>
//       )}

//       {/* Registration Modal */}
//       <Modal visible={showRegistrationModal} transparent animationType="fade">
//         <View style={styles.registrationModal}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Complete Your Registration</Text>
//             <Text style={styles.modalText}>Please provide your details to continue.</Text>
//             <TextInput
//               style={styles.modalInput}
//               placeholder="Name"
//               value={name}
//               onChangeText={setName}
//               placeholderTextColor="#666666"
//             />
//             <TextInput
//               style={styles.modalInput}
//               placeholder="Address"
//               value={address}
//               onChangeText={setAddress}
//               placeholderTextColor="#666666"
//             />
//             <TouchableOpacity
//               style={styles.submitButton}
//               onPress={handleSubmitRegistration}
//               disabled={loadingRegistration}
//             >
//               {loadingRegistration ? (
//                 <ActivityIndicator color="#ffffff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Submit</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 20,
//     paddingTop: Platform.OS === 'android' ? 40 : 20,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f5f5f5',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 15,
//     padding: 5,
//   },
//   tabButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//   },
//   activeTab: { backgroundColor: '#4caf50' },
//   tabText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#4caf50' },
//   activeTabText: { color: '#ffffff' },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     zIndex: 10,
//   },
//   registrationModal: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     padding: 20,
//     width: width * 0.8,
//     alignItems: 'center',
//   },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333333' },
//   modalText: { fontSize: 14, color: '#666666', marginBottom: 20, textAlign: 'center' },
//   modalInput: {
//     width: '100%',
//     height: 40,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 15,
//     color: '#333333',
//   },
//   submitButton: {
//     backgroundColor: '#4caf50',
//     width: '100%',
//     height: 40,
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   submitButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
//   loadingContainer: {
//     width: '75%',
//     height: '100%',
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666666',
//   },
// });
