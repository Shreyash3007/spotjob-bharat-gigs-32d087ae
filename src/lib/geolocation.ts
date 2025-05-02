import { useEffect, useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationResult {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export interface LocationDistance {
  distance: number; // in kilometers
  duration?: number; // in minutes (if travel time is enabled)
  mode?: "walking" | "driving" | "transit";
}

const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  start: Coordinates,
  end: Coordinates
): number {
  const dLat = toRad(end.latitude - start.latitude);
  const dLon = toRad(end.longitude - start.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(start.latitude)) * Math.cos(toRad(end.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance;
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get current position as a Promise
export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Custom hook for geolocation
export function useGeolocation(options?: PositionOptions): GeolocationResult {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const getPosition = async () => {
      try {
        setIsLoading(true);
        const position = await getCurrentPosition(options);
        
        if (isMounted) {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setCoordinates(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    getPosition();
    
    return () => {
      isMounted = false;
    };
  }, [options]);
  
  return { coordinates, error, isLoading };
}

// Calculate travel time between two coordinates using Google Maps API
export async function calculateTravelTime(
  origin: Coordinates,
  destination: Coordinates,
  mode: "walking" | "driving" | "transit" = "driving",
  apiKey: string
): Promise<LocationDistance> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&mode=${mode}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status !== "OK") {
      throw new Error(`Google API Error: ${data.status}`);
    }
    
    const distance = data.rows[0].elements[0].distance.value / 1000; // Convert meters to kilometers
    const duration = data.rows[0].elements[0].duration.value / 60; // Convert seconds to minutes
    
    return { distance, duration, mode };
  } catch (error) {
    console.error("Error calculating travel time:", error);
    
    // Fall back to haversine calculation if API fails
    const distanceKm = calculateDistance(origin, destination);
    
    return { distance: distanceKm, mode };
  }
}

// Filter locations by radius
export function filterByRadius(
  userLocation: Coordinates,
  locations: Array<{ coordinates: Coordinates; [key: string]: any }>,
  radiusKm: number
): Array<{ coordinates: Coordinates; distance: number; [key: string]: any }> {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(userLocation, location.coordinates)
    }))
    .filter(location => location.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// Get address from coordinates (reverse geocoding)
export async function getAddressFromCoordinates(
  coordinates: Coordinates,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status !== "OK") {
      throw new Error(`Geocoding API Error: ${data.status}`);
    }
    
    return data.results[0].formatted_address;
  } catch (error) {
    console.error("Error getting address:", error);
    return "Unknown location";
  }
}

// Get coordinates from address (forward geocoding)
export async function getCoordinatesFromAddress(
  address: string,
  apiKey: string
): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status !== "OK") {
      throw new Error(`Geocoding API Error: ${data.status}`);
    }
    
    const location = data.results[0].geometry.location;
    
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
} 