import * as Location from 'expo-location';

export interface LocationData {
  lat: number;
  lng: number;
}

export interface AddressData {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  name?: string;
  formattedAddress?: string;
}

export interface LocationWithAddress extends LocationData {
  address?: AddressData;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

export const getCurrentLocationWithAddress = async (options?: {
  timeout?: number;
  enableHighAccuracy?: boolean;
  showSnackbar?: (message: string, type: 'success' | 'error' | 'info') => void;
}): Promise<LocationWithAddress | null> => {
  const { 
    timeout = 15000, 
    enableHighAccuracy = true, 
    showSnackbar 
  } = options || {};

  try {
    // Check if location permission is already granted
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      const errorMessage = 'Location permission denied. Please enable location access in settings.';
      if (showSnackbar) showSnackbar(errorMessage, 'error');
      throw new Error(errorMessage);
    }

    if (showSnackbar) showSnackbar('Getting your location...', 'info');

    // Get current position with enhanced options
    const location = await Location.getCurrentPositionAsync({
      accuracy: enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
      timeInterval: timeout,
      distanceInterval: 0,
    });

    const coords = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };

    if (showSnackbar) showSnackbar('Getting address details...', 'info');

    // Get address from coordinates with retry logic
    let address = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !address) {
      try {
        address = await getAddressFromCoordinates(coords.lat, coords.lng);
        if (address) break;
      } catch (addressError) {
        console.warn(`Address lookup attempt ${retryCount + 1} failed:`, addressError);
      }
      retryCount++;
      
      // Wait before retry
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const result = {
      ...coords,
      address: address || {
        formattedAddress: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        city: 'Unknown Location',
        region: 'Unknown Region',
        country: 'Unknown Country',
      },
    };

    if (showSnackbar) {
      const locationName = address?.city || address?.region || 'Unknown Location';
      showSnackbar(`Location found: ${locationName}`, 'success');
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
    console.error('Error getting current location with address:', error);
    
    if (showSnackbar) showSnackbar(errorMessage, 'error');
    return null;
  }
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<AddressData | null> => {
  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      
      // Create formatted address
      const addressParts = [
        address.streetNumber,
        address.street,
        address.city,
        address.region,
        address.postalCode,
        address.country,
      ].filter(Boolean);

      return {
        street: address.street || undefined,
        city: address.city || undefined,
        region: address.region || undefined,
        country: address.country || undefined,
        postalCode: address.postalCode || undefined,
        name: address.name || undefined,
        formattedAddress: addressParts.join(', '),
      };
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

export const searchLocationByAddress = async (
  searchText: string
): Promise<LocationWithAddress[]> => {
  try {
    const geocoded = await Location.geocodeAsync(searchText);
    
    const results: LocationWithAddress[] = [];
    
    for (const location of geocoded) {
      const address = await getAddressFromCoordinates(
        location.latitude,
        location.longitude
      );
      
      results.push({
        lat: location.latitude,
        lng: location.longitude,
        address: address || undefined,
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error searching location by address:', error);
    return [];
  }
};

export const isLocationPermissionGranted = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};
