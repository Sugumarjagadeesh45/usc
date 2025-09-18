// D:\newapp\userapp-main 2\userapp-main\src\Screen1\Taxibooking\TaxiContent.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  Switch,
  Modal,
  TextInput,
  PermissionsAndroid,
  Platform,
  Image
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import socket from '../../socket';
import haversine from 'haversine-distance';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendUrl } from '../../util/backendConfig';

// Professional SVG icons
const TaxiIcon = ({ color = '#000000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" fill={color} />
    <Path d="M5 11l1.5-4.5h11L19 11H5z" fill="#FFFFFF" opacity={0.8} />
    <Rect x="10" y="3" width="4" height="2" rx="0.5" fill={color} />
    <Rect x="9" y="5" width="6" height="1" rx="0.5" fill={color} />
    <Circle cx="6.5" cy="16" r="1.5" fill={color} />
    <Circle cx="17.5" cy="16" r="1.5" fill={color} />
  </Svg>
);

const PortIcon = ({ color = '#000000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill={color} />
    <Path d="M3 6h14v2H3z" fill={color} opacity={0.7} />
    <Path d="M5 10h12v1H5z" fill={color} opacity={0.5} />
  </Svg>
);

const BikeIcon = ({ color = '#000000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M6.5 16l3.5-6l3 5l2-3l3 4" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 10c0-1.1 0.9-2 2-2s2 0.9 2 2-0.9 2-2 2-2-0.9-2-2z" fill={color} />
    <Path d="M14 11c0-1.1 0.9-2 2-2s2 0.9 2 2-0.9 2-2 2-2-0.9-2-2z" fill={color} />
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={2} fill="none" />
    <Circle cx="18" cy="16" r="1" fill={color} />
    <Circle cx="6" cy="16" r="3" stroke={color} strokeWidth={2} fill="none" />
    <Circle cx="6" cy="16" r="1" fill={color} />
    <Circle cx="10" cy="16" r="1.5" stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M10 14.5v3M8.5 16h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M10 16c-1.5 0-2.5-1-2.5-2.5" stroke={color} strokeWidth={1} fill="none" strokeDasharray="1,1" />
    <Circle cx="12" cy="8" r="2" fill="#4CAF50" />
  </Svg>
);

const RideTypeSelector = ({ selectedRideType, setSelectedRideType }) => {
  return (
    <View style={styles.rideTypeContainer}>
      <TouchableOpacity
        style={[
          styles.rideTypeButton,
          selectedRideType === 'taxi' && styles.selectedRideTypeButton,
        ]}
        onPress={() => setSelectedRideType('taxi')}
      >
        <TaxiIcon color={selectedRideType === 'taxi' ? '#FFFFFF' : '#000000'} size={24} />
        <Text style={[
          styles.rideTypeText,
          selectedRideType === 'taxi' && styles.selectedRideTypeText,
        ]}>Taxi</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.rideTypeButton,
          selectedRideType === 'bike' && styles.selectedRideTypeButton,
        ]}
        onPress={() => setSelectedRideType('bike')}
      >
        <BikeIcon color={selectedRideType === 'bike' ? '#FFFFFF' : '#000000'} size={24} />
        <Text style={[
          styles.rideTypeText,
          selectedRideType === 'bike' && styles.selectedRideTypeText,
        ]}>Bike</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.rideTypeButton,
          selectedRideType === 'port' && styles.selectedRideTypeButton,
        ]}
        onPress={() => setSelectedRideType('port')}
      >
        <PortIcon color={selectedRideType === 'port' ? '#FFFFFF' : '#000000'} size={24} />
        <Text style={[
          styles.rideTypeText,
          selectedRideType === 'port' && styles.selectedRideTypeText,
        ]}>Port</Text>
      </TouchableOpacity>
    </View>
  );
};

interface LocationType {
  latitude: number;
  longitude: number;
}

interface SuggestionType {
  id: string;
  name: string;
  address: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface DriverType {
  driverId: string;
  name: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  vehicleType: string;
  status?: string;
}

interface TaxiContentProps {
  loadingLocation?: boolean;
  currentLocation: LocationType | null;
  lastSavedLocation: LocationType | null;
  pickup: string;
  dropoff: string;
  handlePickupChange: (text: string) => void;
  handleDropoffChange: (text: string) => void;
}

const TaxiContent: React.FC<TaxiContentProps> = ({
  loadingLocation: propLoadingLocation,
  currentLocation: propCurrentLocation,
  lastSavedLocation: propLastSavedLocation,
  pickup,
  dropoff,
  handlePickupChange: propHandlePickupChange,
  handleDropoffChange: propHandleDropoffChange,
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedRideType, setSelectedRideType] = useState<string>('taxi');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [wantReturn, setWantReturn] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [travelTime, setTravelTime] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingOTP, setBookingOTP] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [pickupLocation, setPickupLocation] = useState<LocationType | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationType | null>(null);
  const [routeCoords, setRouteCoords] = useState<LocationType[]>([]);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "onTheWay" | "arrived" | "started" | "completed">("idle");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<LocationType | null>(null);
  const [travelledKm, setTravelledKm] = useState(0);
  const [lastCoord, setLastCoord] = useState<LocationType | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverType[]>([]);
  const [nearbyDriversCount, setNearbyDriversCount] = useState<number>(0);
  
  const [pickupSuggestions, setPickupSuggestions] = useState<SuggestionType[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<SuggestionType[]>([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  
  const [pickupLoading, setPickupLoading] = useState(false);
  const [dropoffLoading, setDropoffLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [pickupCache, setPickupCache] = useState<Record<string, SuggestionType[]>>({});
  const [dropoffCache, setDropoffCache] = useState<Record<string, SuggestionType[]>>({});
  
  const [isPickupCurrent, setIsPickupCurrent] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const pickupDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const dropoffDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView | null>(null);

  const fallbackLocation: LocationType = {
    latitude: 11.3312971,
    longitude: 77.7167303,
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const fetchNearbyDrivers = (latitude: number, longitude: number) => {
    console.log(`Fetching nearby drivers for lat: ${latitude}, lng: ${longitude}`);
    if (socket && socketConnected) {
      socket.emit("requestNearbyDrivers", { 
        latitude, 
        longitude, 
        radius: 10000,
        vehicleType: selectedRideType 
      });
      console.log("Emitted requestNearbyDrivers event");
    } else {
      console.log("Socket not connected, attempting to reconnect...");
      socket.connect();
      socket.once("connect", () => {
        console.log("Socket reconnected, emitting requestNearbyDrivers");
        socket.emit("requestNearbyDrivers", { 
          latitude, 
          longitude, 
          radius: 10000,
          vehicleType: selectedRideType 
        });
      });
    }
  };

  useEffect(() => {
    const handleNearbyDriversResponse = (data: { drivers: DriverType[] }) => {
      console.log('Received nearby drivers response:', JSON.stringify(data, null, 2));
      if (!location) {
        console.log("No location available, can't process drivers");
        return;
      }
      
      const filteredDrivers = data.drivers
        .filter(driver => {
          if (driver.status && !["Live", "online", "onRide", "available"].includes(driver.status)) {
            console.log(`Driver ${driver.driverId} filtered out by status: ${driver.status}`);
            return false;
          }
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            driver.location.coordinates[1],
            driver.location.coordinates[0]
          );
          console.log(`Driver ${driver.driverId} distance: ${distance.toFixed(2)} km`);
          return distance <= 10;
        })
        .sort((a, b) => calculateDistance(location.latitude, location.longitude, a.location.coordinates[1], a.location.coordinates[0]) -
                         calculateDistance(location.latitude, location.longitude, b.location.coordinates[1], b.location.coordinates[0]))
        .slice(0, 10);
      
      console.log('Filtered drivers:', filteredDrivers.length, JSON.stringify(filteredDrivers, null, 2));
      setNearbyDrivers(filteredDrivers);
      setNearbyDriversCount(filteredDrivers.length);
    };

    socket.on("nearbyDriversResponse", handleNearbyDriversResponse);
    return () => socket.off("nearbyDriversResponse", handleNearbyDriversResponse);
  }, [location, socketConnected]);

  useEffect(() => {
    const requestLocation = async () => {
      setIsLoadingLocation(true);

      if (propCurrentLocation) {
        console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Using current location from props:`, propCurrentLocation);
        setLocation(propCurrentLocation);
        setPickupLocation(propCurrentLocation);
        propHandlePickupChange("My Current Location");
        setIsPickupCurrent(true);
        global.currentLocation = propCurrentLocation;
        fetchNearbyDrivers(propCurrentLocation.latitude, propCurrentLocation.longitude);
        setIsLoadingLocation(false);
        return;
      }

      if (propLastSavedLocation) {
        console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Using last saved location from props:`, propLastSavedLocation);
        setLocation(propLastSavedLocation);
        setPickupLocation(propLastSavedLocation);
        propHandlePickupChange("My Current Location");
        setIsPickupCurrent(true);
        global.currentLocation = propLastSavedLocation;
        fetchNearbyDrivers(propLastSavedLocation.latitude, propLastSavedLocation.longitude);
        setIsLoadingLocation(false);
        return;
      }

      console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Using fallback location:`, fallbackLocation);
      setLocation(fallbackLocation);
      setPickupLocation(fallbackLocation);
      propHandlePickupChange("My Current Location");
      setIsPickupCurrent(true);
      global.currentLocation = fallbackLocation;
      fetchNearbyDrivers(fallbackLocation.latitude, fallbackLocation.longitude);
      setIsLoadingLocation(false);

      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Location permission denied`);
          Alert.alert("Permission Denied", "Location permission is required to proceed.");
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Live location fetched successfully:`, loc);
          setLocation(loc);
          setPickupLocation(loc);
          propHandlePickupChange("My Current Location");
          setIsPickupCurrent(true);
          global.currentLocation = loc;
          fetchNearbyDrivers(loc.latitude, loc.longitude);
        },
        (err) => {
          console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Location error:`, err.code, err.message);
          Alert.alert("Location Error", "Could not fetch location. Please try again or check your GPS settings.");
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000, distanceFilter: 10 }
      );
    };
    requestLocation();
  }, [propCurrentLocation, propLastSavedLocation]);

  useEffect(() => {
    const handleConnect = () => { console.log("Socket connected"); setSocketConnected(true); if (location) fetchNearbyDrivers(location.latitude, location.longitude); };
    const handleDisconnect = () => { console.log("Socket disconnected"); setSocketConnected(false); };
    const handleConnectError = (error: Error) => { console.error("Socket connection error:", error); setSocketConnected(false); };
    
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    setSocketConnected(socket.connected);
    
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (location && (rideStatus === "idle" || rideStatus === "searching")) {
        Geolocation.getCurrentPosition(
          (pos) => {
            const newLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            setLocation(newLoc);
            if (isPickupCurrent && dropoffLocation) {
              setPickupLocation(newLoc);
              fetchRoute(newLoc);
            }
            fetchNearbyDrivers(newLoc.latitude, newLoc.longitude);
          },
          (err) => { console.error("Live location error:", err); },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [rideStatus, isPickupCurrent, dropoffLocation, location, socketConnected]);

  useEffect(() => {
    const handleDriverLiveLocationUpdate = (data: { driverId: string; lat: number; lng: number; status?: string }) => {
      if (!location) return;
      if (data.driverId.includes('BOT')) return;
      
      setNearbyDrivers((prev) => {
        const existingIndex = prev.findIndex(d => d.driverId === data.driverId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            location: { coordinates: [data.lng, data.lat] },
            status: data.status || "Live"
          };
          return updated;
        } else {
          if (data.status && !["Live", "online", "onRide", "available"].includes(data.status)) return prev;
          return [
            ...prev,
            {
              driverId: data.driverId,
              name: `Driver ${data.driverId}`,
              location: { coordinates: [data.lng, data.lat] },
              vehicleType: "taxi",
              status: data.status || "Live"
            }
          ];
        }
      });
    };
    
    socket.on("driverLiveLocationUpdate", handleDriverLiveLocationUpdate);
    return () => socket.off("driverLiveLocationUpdate", handleDriverLiveLocationUpdate);
  }, [location]);

  useEffect(() => {
    const handleDriverOffline = (data: { driverId: string }) => {
      console.log(`Driver ${data.driverId} went offline`);
      setNearbyDrivers(prev => prev.filter(driver => driver.driverId !== data.driverId));
      setNearbyDriversCount(prev => Math.max(0, prev - 1));
    };
    
    socket.on("driverOffline", handleDriverOffline);
    return () => socket.off("driverOffline", handleDriverOffline);
  }, []);

  useEffect(() => {
    const handleDriverStatusUpdate = (data: { driverId: string; status: string }) => {
      console.log(`Driver ${data.driverId} status updated to: ${data.status}`);
      if (data.status === "offline") {
        setNearbyDrivers(prev => prev.filter(driver => driver.driverId !== data.driverId));
        setNearbyDriversCount(prev => Math.max(0, prev - 1));
        return;
      }
      setNearbyDrivers(prev => prev.map(driver => 
        driver.driverId === data.driverId ? { ...driver, status: data.status } : driver
      ));
    };
    
    socket.on("driverStatusUpdate", handleDriverStatusUpdate);
    return () => socket.off("driverStatusUpdate", handleDriverStatusUpdate);
  }, []);

  useEffect(() => {
    if (!currentRideId) return;
    const rideAccepted = (data: any) => {
      if (data.rideId === currentRideId) {
        setRideStatus("onTheWay");
        setDriverId(data.driverId);
        Alert.alert("Driver on the way 🚖");
      }
    };
    const driverLocUpdate = (data: any) => {
      if (data.rideId === currentRideId) {
        const coords = { latitude: data.lat, longitude: data.lng };
        setDriverLocation(coords);
        if (lastCoord) {
          const dist = haversine(lastCoord, coords);
          setTravelledKm(prev => prev + dist / 1000);
        }
        setLastCoord(coords);
      }
    };
    const rideStatusUpdate = (data: any) => {
      if (data.rideId === currentRideId) {
        setRideStatus(data.status);
        if (data.status === "completed") {
          Alert.alert("🎉 Ride Completed", `Distance Travelled: ${travelledKm.toFixed(2)} km`);
          setTimeout(() => {
            setCurrentRideId(null);
            setDriverId(null);
            setDriverLocation(null);
            setRouteCoords([]);
            setPickupLocation(null);
            setDropoffLocation(null);
            propHandlePickupChange("");
            propHandleDropoffChange("");
            setRideStatus("idle");
          }, 3000);
        }
      }
    };
    const rideOtpListener = ({ rideId, otp }: any) => {
      if (rideId === currentRideId) {
        setBookingOTP(otp);
        setShowConfirmModal(true);
        Alert.alert("OTP Received", `Share OTP with driver: ${otp}`);
      }
    };
    const rideCreated = (data: any) => {
      if (data.rideId === currentRideId) {
        setBookingOTP(data.otp);
        setShowConfirmModal(true);
        Alert.alert(
          "Ride Booked Successfully! 🎉",
          `Your ride has been booked. Your OTP is: ${data.otp}\nPlease share this OTP with your driver.`
        );
        setRideStatus("searching");
      } else if (data.message) {
        Alert.alert("Booking Failed", data.message || "Failed to book ride");
        setRideStatus("idle");
        setCurrentRideId(null);
      }
    };

    socket.on("rideAccepted", rideAccepted);
    socket.on("driverLocationUpdate", driverLocUpdate);
    socket.on("rideStatusUpdate", rideStatusUpdate);
    socket.on("rideOTP", rideOtpListener);
    socket.on("rideCreated", rideCreated); // Add listener for rideCreated event

    return () => {
      socket.off("rideAccepted", rideAccepted);
      socket.off("driverLocationUpdate", driverLocUpdate);
      socket.off("rideStatusUpdate", rideStatusUpdate);
      socket.off("rideOTP", rideOtpListener);
      socket.off("rideCreated", rideCreated); // Cleanup rideCreated listener
    };
  }, [currentRideId, lastCoord, travelledKm]);

  const handleMapPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    if (!pickupLocation) {
      setPickupLocation(coords);
      propHandlePickupChange("Pickup Selected");
      setIsPickupCurrent(false);
      fetchNearbyDrivers(coords.latitude, coords.longitude);
    } else if (!dropoffLocation) {
      setDropoffLocation(coords);
      propHandleDropoffChange("Dropoff Selected");
      fetchRoute(coords);
    } else {
      setPickupLocation(coords);
      propHandlePickupChange("Pickup Selected");
      setIsPickupCurrent(false);
      setDropoffLocation(null);
      propHandleDropoffChange("");
      setRouteCoords([]);
      fetchNearbyDrivers(coords.latitude, coords.longitude);
    }
  };

  const fetchRoute = async (dropCoord: LocationType) => {
    if (!pickupLocation) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickupLocation.longitude},${pickupLocation.latitude};${dropCoord.longitude},${dropCoord.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === "Ok" && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
        setDistance((data.routes[0].distance / 1000).toFixed(2) + " km");
        setTravelTime(Math.round(data.routes[0].duration / 60) + " mins");
      } else {
        setApiError("Failed to fetch route");
        Alert.alert("Route Error", "Could not find route. Please try different locations.");
      }
    } catch (err) {
      console.error(err);
      setRouteCoords([]);
      setApiError("Network error fetching route");
      Alert.alert("Route Error", "Failed to fetch route. Please check your internet connection.");
    }
  };

  const fetchSuggestions = async (query: string, type: 'pickup' | 'dropoff'): Promise<SuggestionType[]> => {
    try {
      console.log(`Fetching suggestions for: ${query}`);
      const cache = type === 'pickup' ? pickupCache : dropoffCache;
      if (cache[query]) {
        console.log(`Returning cached suggestions for: ${query}`);
        return cache[query];
      }
      if (type === 'pickup') setPickupLoading(true);
      else setDropoffLoading(true);
      setSuggestionsError(null);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&countrycodes=IN`;
      console.log(`API URL: ${url}`);
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EAZYGOApp/1.0' },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      
      const suggestions: SuggestionType[] = data.map((item: any) => ({
        id: item.place_id || `${item.lat}-${item.lon}`,
        name: item.display_name,
        address: extractAddress(item),
        lat: item.lat,
        lon: item.lon,
        type: item.type || 'unknown',
        importance: item.importance || 0,
      }));
      if (type === 'pickup') setPickupCache(prev => ({ ...prev, [query]: suggestions }));
      else setDropoffCache(prev => ({ ...prev, [query]: suggestions }));
      return suggestions;
    } catch (error: any) {
      console.error('Suggestions fetch error:', error);
      setSuggestionsError(error.message || 'Failed to fetch suggestions');
      return [];
    } finally {
      if (type === 'pickup') setPickupLoading(false);
      else setDropoffLoading(false);
    }
  };

  const extractAddress = (item: any): string => {
    if (item.address) {
      const parts = [];
      if (item.address.road) parts.push(item.address.road);
      if (item.address.suburb) parts.push(item.address.suburb);
      if (item.address.city || item.address.town || item.address.village) parts.push(item.address.city || item.address.town || item.address.village);
      if (item.address.state) parts.push(item.address.state);
      if (item.address.postcode) parts.push(item.address.postcode);
      return parts.join(', ');
    }
    return item.display_name;
  };

  const handlePickupChange = (text: string) => {
    console.log(`handlePickupChange called with: "${text}"`);
    propHandlePickupChange(text);
    if (pickupDebounceTimer.current) {
      clearTimeout(pickupDebounceTimer.current);
      pickupDebounceTimer.current = null;
    }
    if (text.length > 2) {
      setPickupLoading(true);
      setShowPickupSuggestions(true);
      pickupDebounceTimer.current = setTimeout(async () => {
        const sugg = await fetchSuggestions(text, 'pickup');
        setPickupSuggestions(sugg);
        setPickupLoading(false);
      }, 500);
    } else {
      setShowPickupSuggestions(false);
      setPickupSuggestions([]);
    }
  };

  const handleDropoffChange = (text: string) => {
    console.log(`handleDropoffChange called with: "${text}"`);
    propHandleDropoffChange(text);
    if (dropoffDebounceTimer.current) {
      clearTimeout(dropoffDebounceTimer.current);
      dropoffDebounceTimer.current = null;
    }
    if (text.length > 2) {
      setDropoffLoading(true);
      setShowDropoffSuggestions(true);
      dropoffDebounceTimer.current = setTimeout(async () => {
        const sugg = await fetchSuggestions(text, 'dropoff');
        setDropoffSuggestions(sugg);
        setDropoffLoading(false);
      }, 500);
    } else {
      setShowDropoffSuggestions(false);
      setDropoffSuggestions([]);
    }
  };

  const selectPickupSuggestion = (suggestion: SuggestionType) => {
    propHandlePickupChange(suggestion.name);
    setPickupLocation({ latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) });
    setShowPickupSuggestions(false);
    setIsPickupCurrent(false);
    if (dropoffLocation) fetchRoute({ latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) });
    fetchNearbyDrivers(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
  };

  const selectDropoffSuggestion = (suggestion: SuggestionType) => {
    propHandleDropoffChange(suggestion.name);
    setDropoffLocation({ latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) });
    setShowDropoffSuggestions(false);
    if (pickupLocation) fetchRoute({ latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon) });
  };

  const calculatePrice = () => {
    if (!pickupLocation || !dropoffLocation || !distance) return null;
    const distanceKm = parseFloat(distance);
    let baseFare = 0;
    let perKm = 0;
    switch (selectedRideType) {
      case 'bike': baseFare = 20; perKm = 8; break;
      case 'taxi': baseFare = 50; perKm = 15; break;
      case 'port': baseFare = 80; perKm = 25; break;
      default: baseFare = 50; perKm = 15;
    }
    const multiplier = wantReturn ? 2 : 1;
    return Math.round((baseFare + (distanceKm * perKm)) * multiplier);
  };

  useEffect(() => {
    if (pickupLocation && dropoffLocation && distance) {
      const price = calculatePrice();
      setEstimatedPrice(price);
    }
  }, [pickupLocation, dropoffLocation, selectedRideType, wantReturn, distance]);

  useEffect(() => {
    if (showPricePanel) {
      Animated.timing(panelAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(panelAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showPricePanel]);

  const handleRideTypeSelect = (type: string) => {
    if (selectedRideType === type) return;
    setSelectedRideType(type);
    setShowPricePanel(true);
    if (pickupLocation && dropoffLocation) {
      const price = calculatePrice();
      setEstimatedPrice(price);
    }
    if (location) {
      fetchNearbyDrivers(location.latitude, location.longitude);
    }
  };

const handleBookRide = async () => {
  try {
    // Check for authentication token
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Authentication Error', 'Please log in to book a ride');
      return;
    }

    // Get user ID or fallback to default
    const userId = await AsyncStorage.getItem('userId') || 'U001';

    // Validate pickup and dropoff locations
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Please select both pickup and dropoff locations');
      return;
    }

    // Validate estimated price
    if (!estimatedPrice) {
      Alert.alert('Error', 'Price calculation failed. Please try again.');
      return;
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setBookingOTP(otp);

    // Set ride ID and status
    const rideId = 'RID' + Date.now();
    setCurrentRideId(rideId);
    setRideStatus('searching');

    // Show customized alert for ride booking
    Alert.alert(
      'Ride Booked!',
      `Your ride is confirmed. OTP: ${otp}\nShare this OTP with your driver.`,
      [
        {
          text: 'OK',
          onPress: () => setShowConfirmModal(true),
          style: 'default',
        },
      ],
      { cancelable: false } // Prevents dismissing the alert by tapping outside
    );

    // Emit booking event via socket
    socket.emit('bookRide', {
      rideId,
      userId,
      pickup: { lat: pickupLocation.latitude, lng: pickupLocation.longitude, address: pickup },
      drop: { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude, address: dropoff },
      vehicleType: selectedRideType,
    });
  } catch (error) {
    console.error('Booking error:', error);
    Alert.alert('Booking Failed', 'An unexpected error occurred. Please try again.');
  }
};

  useEffect(() => {
    const handleRideCreated = (data) => {
      console.log('Ride created event received:', data);
      if (data.success && data.rideId === currentRideId) {
        const customerId = AsyncStorage.getItem('customerId') || 'U001';
        const otp = customerId.slice(-4);
        setBookingOTP(data.otp || otp); // Use OTP from event or fallback to customerId
        setShowConfirmModal(true);
        Alert.alert(
          "Ride Booked Successfully! 🎉",
          `Your ride has been booked. Your OTP is: ${data.otp || otp}\nPlease share this OTP with your driver.`
        );
        setRideStatus("searching");
      } else if (data.message) {
        Alert.alert("Booking Failed", data.message || "Failed to book ride");
        setRideStatus("idle");
        setCurrentRideId(null);
      }
    };

    const handleRideBookingError = (error) => {
      console.error('Ride booking error:', error);
      Alert.alert("Booking Error", error.message);
      setRideStatus("idle");
      setCurrentRideId(null);
    };

    socket.on("rideCreated", handleRideCreated);
    socket.on("rideBookingError", handleRideBookingError);

    return () => {
      socket.off("rideCreated", handleRideCreated);
      socket.off("rideBookingError", handleRideBookingError);
    };
  }, [currentRideId]);

  const handleConfirmBooking = () => {
    console.log('Simulating booking confirmation process...');
    
    if (!currentRideId || !bookingOTP) {
      Alert.alert("Error", "Invalid booking state. Please try booking again.");
      return;
    }
    
    setRideStatus("onTheWay"); // Simulate driver acceptance
    setShowConfirmModal(false);
    Alert.alert(
      'Booking Confirmed',
      `Your ride has been booked with OTP: ${bookingOTP}\nDriver will arrive shortly.`
    );

    // Simulate ride progression locally
    setTimeout(() => {
      setRideStatus("arrived");
      Alert.alert("Driver Arrived", "Your driver has arrived. Share the OTP to start.");
    }, 5000); // 5 seconds delay

    setTimeout(() => {
      setRideStatus("completed");
      Alert.alert("🎉 Ride Completed", `Distance Travelled: ${travelledKm.toFixed(2)} km`);
      setTimeout(() => {
        setCurrentRideId(null);
        setDriverId(null);
        setDriverLocation(null);
        setRouteCoords([]);
        setPickupLocation(null);
        setDropoffLocation(null);
        propHandlePickupChange("");
        propHandleDropoffChange("");
        setRideStatus("idle");
      }, 3000);
    }, 10000); // 10 seconds for completion
  };

  const renderVehicleIcon = (type: 'bike' | 'taxi' | 'port', size: number = 24, color: string = '#000000') => {
    try {
      switch (type) {
        case 'bike': return <BikeIcon color={color} size={size} />;
        case 'taxi': return <TaxiIcon color={color} size={size} />;
        case 'port': return <PortIcon color={color} size={size} />;
        default: return <TaxiIcon color={color} size={size} />;
      }
    } catch (error) {
      return <TaxiIcon color={color} size={size} />;
    }
  };

  const renderSuggestionItem = (item: SuggestionType, onSelect: () => void, key: string) => {
    let iconName = 'location-on';
    let iconColor = '#A9A9A9';
    if (item.type.includes('railway') || item.type.includes('station')) { iconName = 'train'; iconColor = '#3F51B5'; }
    else if (item.type.includes('airport')) { iconName = 'flight'; iconColor = '#2196F3'; }
    else if (item.type.includes('bus')) { iconName = 'directions-bus'; iconColor = '#FF9800'; }
    else if (item.type.includes('hospital')) { iconName = 'local-hospital'; iconColor = '#F44336'; }
    else if (item.type.includes('school') || item.type.includes('college')) { iconName = 'school'; iconColor = '#4CAF50'; }
    else if (item.type.includes('place_of_worship')) { iconName = 'church'; iconColor = '#9C27B0'; }
    else if (item.type.includes('shop') || item.type.includes('mall')) { iconName = 'shopping-mall'; iconColor = '#E91E63'; }
    else if (item.type.includes('park')) { iconName = 'park'; iconColor = '#4CAF50'; }
    
    return (
      <TouchableOpacity key={key} style={styles.suggestionItem} onPress={onSelect}>
        <MaterialIcons name={iconName as any} size={20} color={iconColor} style={styles.suggestionIcon} />
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionMainText} numberOfLines={1}>{extractMainName(item.name)}</Text>
          <Text style={styles.suggestionSubText} numberOfLines={1}>{item.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const extractMainName = (fullName: string): string => {
    const parts = fullName.split(',');
    return parts[0].trim();
  };
  
  const isBookRideButtonEnabled = pickup && dropoff && selectedRideType && estimatedPrice !== null;
  
  return (
    <View style={styles.container}>
      {isLoadingLocation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Fetching your location...</Text>
        </View>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={{
                latitude: location?.latitude || 11.018,
                longitude: location?.longitude || 77.012,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
              showsUserLocation
              onPress={handleMapPress}
            >
              {pickupLocation && <Marker coordinate={pickupLocation} title="Pickup" pinColor="blue" />}
              {dropoffLocation && <Marker coordinate={dropoffLocation} title="Dropoff" pinColor="red" />}
              {driverLocation && (
                <Marker coordinate={driverLocation} title="Driver">
                  <View style={styles.vehicleMarkerContainer}>
                    {renderVehicleIcon(selectedRideType as 'bike' | 'taxi' | 'port', 30, '#000000')}
                  </View>
                </Marker>
              )}
              {nearbyDrivers.map((driver) => (
                <Marker
                  key={driver.driverId}
                  coordinate={{
                    latitude: driver.location.coordinates[1],
                    longitude: driver.location.coordinates[0],
                  }}
                  title={`${driver.name} (${driver.status || 'Live'})`}
                >
                  <View style={styles.driverMarkerContainer}>
                    <View style={styles.redDotMarker} />
                    <View style={styles.vehicleIconContainer}>
                      {renderVehicleIcon(driver.vehicleType as 'bike' | 'taxi' | 'port', 20, '#FFFFFF')}
                    </View>
                  </View>
                </Marker>
              ))}
              {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#4CAF50" />}
            </MapView>
            
            <View style={styles.driversCountOverlay}>
              <Text style={styles.driversCountText}>
                Available Drivers Nearby: {nearbyDriversCount}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="my-location" size={20} color="#4CAF50" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Pickup Location"
                value={pickup}
                onChangeText={handlePickupChange}
                placeholderTextColor="#999"
              />
            </View>
            
            {showPickupSuggestions && (
              <View style={styles.suggestionsContainer}>
                {pickupLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading suggestions...</Text>
                  </View>
                ) : suggestionsError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{suggestionsError}</Text>
                  </View>
                ) : pickupSuggestions.length > 0 ? (
                  pickupSuggestions.map((item) => (
                    renderSuggestionItem(item, () => selectPickupSuggestion(item), item.id)
                  ))
                ) : (
                  <View style={styles.noSuggestionsContainer}>
                    <Text style={styles.noSuggestionsText}>No suggestions found</Text>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="place" size={20} color="#F44336" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Dropoff Location"
                value={dropoff}
                onChangeText={handleDropoffChange}
                placeholderTextColor="#999"
              />
            </View>
            
            {showDropoffSuggestions && (
              <View style={styles.suggestionsContainer}>
                {dropoffLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading suggestions...</Text>
                  </View>
                ) : suggestionsError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{suggestionsError}</Text>
                  </View>
                ) : dropoffSuggestions.length > 0 ? (
                  dropoffSuggestions.map((item) => (
                    renderSuggestionItem(item, () => selectDropoffSuggestion(item), item.id)
                  ))
                ) : (
                  <View style={styles.noSuggestionsContainer}>
                    <Text style={styles.noSuggestionsText}>No suggestions found</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          {(distance || travelTime) && (
            <View style={styles.distanceTimeContainer}>
              <View style={styles.distanceTimeItem}>
                <MaterialIcons name="route" size={18} color="#757575" />
                <Text style={styles.distanceTimeLabel}>DISTANCE:</Text>
                <Text style={styles.distanceTimeValue}>{distance || '---'}</Text>
              </View>
              <View style={styles.distanceTimeItem}>
                <MaterialIcons name="schedule" size={18} color="#757575" />
                <Text style={styles.distanceTimeLabel}>TRAVEL TIME:</Text>
                <Text style={styles.distanceTimeValue}>{travelTime || '---'}</Text>
              </View>
            </View>
          )}
          
          {apiError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}
          
          <RideTypeSelector
            selectedRideType={selectedRideType}
            setSelectedRideType={handleRideTypeSelect}
          />
          
          <View style={styles.bookRideButtonContainer}>
            <TouchableOpacity
              style={[
                styles.bookRideButton,
                isBookRideButtonEnabled ? styles.enabledBookRideButton : styles.disabledBookRideButton,
              ]}
              onPress={handleBookRide}
              disabled={!isBookRideButtonEnabled}
            >
              <Text style={styles.bookRideButtonText}>BOOK RIDE</Text>
            </TouchableOpacity>
          </View>
          
          {showPricePanel && selectedRideType && (
            <Animated.View
              style={[
                styles.pricePanel,
                {
                  transform: [{
                    translateY: panelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Ride Details</Text>
                <TouchableOpacity onPress={() => setShowPricePanel(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.priceDetailsContainer}>
                <View style={styles.vehicleIconContainer}>
                  {renderVehicleIcon(selectedRideType as 'bike' | 'taxi' | 'port', 40, '#000000')}
                </View>
                <View style={styles.priceInfoContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Pickup:</Text>
                    <Text style={styles.priceValue} numberOfLines={1}>{pickup || 'Not selected'}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Drop-off:</Text>
                    <Text style={styles.priceValue} numberOfLines={1}>{dropoff || 'Not selected'}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Distance:</Text>
                    <Text style={styles.priceValue}>{distance || '---'}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Price:</Text>
                    <Text style={styles.priceValue}>₹{estimatedPrice || '---'}</Text>
                  </View>
                  <View style={styles.returnTripRow}>
                    <Text style={styles.priceLabel}>Return trip:</Text>
                    <Switch
                      value={wantReturn}
                      onValueChange={setWantReturn}
                      trackColor={{ false: '#767577', true: '#4CAF50' }}
                      thumbColor={wantReturn ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.bookButtonContainer}>
                <TouchableOpacity
                  style={styles.bookMyRideButton}
                  onPress={handleBookRide}
                >
                  <Text style={styles.bookMyRideButtonText}>BOOK MY RIDE</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={showConfirmModal}
            onRequestClose={() => setShowConfirmModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirm Booking</Text>
                  <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                  </View>
                  <Text style={styles.modalMessage}>
                    Thank you for choosing EAZY GO!
                  </Text>
                  <Text style={styles.modalSubMessage}>
                    Your ride has been successfully booked.
                  </Text>
                  <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>Your pickup OTP is:</Text>
                    <Text style={styles.otpValue}>{bookingOTP}</Text>
                  </View>
                  <Text style={styles.otpWarning}>
                    Please don't share it with anyone. Only share with our driver.
                  </Text>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleConfirmBooking}
                  >
                    <Text style={styles.modalConfirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#757575', fontSize: 16, marginTop: 10 },
  mapContainer: { 
    height: Dimensions.get('window').height * 0.4, 
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  map: { ...StyleSheet.absoluteFillObject },
  driversCountOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  driversCountText: { fontSize: 14, fontWeight: '600', color: '#333333' },
  inputContainer: { 
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE'
  },
  inputIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#333' },
  suggestionsContainer: { 
    marginTop: 5,
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200
  },
  suggestionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 15,
    borderBottomWidth: 1, 
    borderBottomColor: '#EEEEEE' 
  },
  suggestionIcon: { marginRight: 12 },
  suggestionTextContainer: { flex: 1 },
  suggestionMainText: { fontSize: 16, fontWeight: '500', color: '#333333' },
  suggestionSubText: { fontSize: 12, color: '#757575', marginTop: 2 },
  noSuggestionsContainer: { paddingVertical: 12, alignItems: 'center' },
  noSuggestionsText: { fontSize: 14, color: '#666666' },
  distanceTimeContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  distanceTimeItem: { flexDirection: 'row', alignItems: 'center' },
  distanceTimeLabel: { fontSize: 14, fontWeight: '600', color: '#757575', marginLeft: 8 },
  distanceTimeValue: { fontSize: 14, fontWeight: 'bold', color: '#333333', marginLeft: 5 },
  rideTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 15 },
  rideTypeButton: { 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 15, 
    width: '30%', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  selectedRideTypeButton: { backgroundColor: '#FF5722' },
  rideTypeText: { marginTop: 5, fontSize: 14, fontWeight: '600', color: '#333333' },
  selectedRideTypeText: { color: '#FFFFFF' },
  bookRideButtonContainer: { marginHorizontal: 20, marginBottom: 20 },
  bookRideButton: { 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  enabledBookRideButton: { backgroundColor: '#FF5722' },
  disabledBookRideButton: { backgroundColor: '#BDBDBD' },
  bookRideButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  errorContainer: { 
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFEBEE', 
    borderRadius: 12, 
    padding: 15, 
    borderLeftWidth: 4, 
    borderLeftColor: '#F44336' 
  },
  errorText: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
  pricePanel: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    maxHeight: Dimensions.get('window').height * 0.5, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 6 
  },
  panelHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15, 
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEEEEE' 
  },
  panelTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333333' 
  },
  priceDetailsContainer: { 
    flexDirection: 'row', 
    marginBottom: 15 
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIconContainer: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
  },
  redDotMarker: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#200808ff',
  },
  priceInfoContainer: { 
    flex: 1 
  },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  priceLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#757575', 
    flex: 1 
  },
  priceValue: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333333', 
    flex: 2, 
    textAlign: 'right' 
  },
  returnTripRow: { 
    flexDirection: 'row', 

    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 5 
  },
  bookButtonContainer: { 
    marginTop: 10 
  },
  bookMyRideButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4 
  },
  bookMyRideButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    width: '85%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 20, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 6 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333333' 
  },
  modalContent: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalIconContainer: { 
    marginBottom: 15 
  },
  modalMessage: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333333', 
    textAlign: 'center', 
    marginBottom: 5 
  },
  modalSubMessage: { 
    fontSize: 16, 
    color: '#666666', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  otpContainer: { 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    marginBottom: 15, 
    width: '100%' 
  },
  otpLabel: { 
    fontSize: 14, 
    color: '#666666', 
    marginBottom: 5 
  },
  otpValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FF5722' 
  },
  otpWarning: { 
    fontSize: 12, 
    color: '#F44336', 
    textAlign: 'center', 
    fontStyle: 'italic' 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  modalCancelButton: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    paddingVertical: 12, 
    borderRadius: 10, 
    marginRight: 10, 
    alignItems: 'center' 
  },
  modalCancelButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#666666' 
  },
  modalConfirmButton: { 
    flex: 1, 
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    borderRadius: 10, 
    marginLeft: 10, 
    alignItems: 'center' 
  },
  modalConfirmButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
  // Marker Styles
  vehicleMarkerContainer: { 
    borderRadius: 20, 
    padding: 5, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 2 
  },
});

export default TaxiContent;