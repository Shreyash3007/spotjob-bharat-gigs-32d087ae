import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  accuracy: number | null;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  timestamp: number | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    accuracy: null,
    latitude: null,
    longitude: null,
    error: null,
    timestamp: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || true,
      maximumAge: options.maximumAge || 30000, // 30 seconds
      timeout: options.timeout || 27000 // 27 seconds
    };

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        accuracy: position.coords.accuracy,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        timestamp: position.timestamp
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Geolocation error: ${error.message}`
      }));
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      geoOptions
    );

    // Set up watchPosition for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      geoOptions
    );

    // Clean up
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options.enableHighAccuracy, options.maximumAge, options.timeout]);

  return state;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
}; 