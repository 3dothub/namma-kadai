import { User } from '../store/slices/authSlice';

export const hasUserLocationData = (user: User | null): boolean => {
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
