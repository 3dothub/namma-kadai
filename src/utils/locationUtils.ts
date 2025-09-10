import { User } from '../store/slices/authSlice';

export const hasUserLocationData = (user: User | null): boolean => {
  // For unauthenticated users, we don't have user.addresses, 
  // so this should return false to rely on store location
  if (!user || !user.addresses || user.addresses.length === 0) {
    return false;
  }
  
  return user.addresses.some(
    address => 
      address.location && 
      address.location.lat && 
      address.location.lng &&
      address.location.lat !== 0 && 
      address.location.lng !== 0
  );
};

export const getUserCurrentLocation = (user: User | null) => {
  if (!hasUserLocationData(user) || !user?.addresses) {
    return null;
  }
  
  // Get the first address with location data (you can modify this logic)
  const addressWithLocation = user.addresses.find(
    address => 
      address.location && 
      address.location.lat && 
      address.location.lng &&
      address.location.lat !== 0 && 
      address.location.lng !== 0
  );
  
  return addressWithLocation ? addressWithLocation.location : null;
};

// Helper function to check if user has any form of location access
// This checks both user data and store location for authenticated/unauthenticated users
export const hasAnyLocationAccess = (user: User | null, storeLocation: any, hasLocationAccess: boolean): boolean => {
  return hasUserLocationData(user) || !!storeLocation || hasLocationAccess;
};
