import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { RootState } from '../store';
import { Snackbar } from './Snackbar';
import { LocationModal } from './LocationModal';
import { setLocationAccess, updateUserData, logout } from '../store/slices/authSlice';
import { setUserLocation } from '../store/slices/productSlice';
import { showSnackbar, hideSnackbar } from '../store/slices/snackbarSlice';
import { useUpdateLocationMutation } from '../store/api/userApi';
// import { useVerifyTokenQuery } from '@/store/api/authApi'; // Temporarily disabled
import { getCurrentLocation, requestLocationPermission } from '../services/locationService';
import { hasUserLocationData, getUserCurrentLocation, hasAnyLocationAccess } from '../utils/locationUtils';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  
  const { visible, message, type } = useSelector((state: RootState) => state.snackbar);
  const { user, isAuthenticated, hasLocationAccess, token } = useSelector((state: RootState) => state.auth);
  const { userLocation } = useSelector((state: RootState) => state.products);
  
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);

  // Temporarily disable token verification as it might be causing issues
  // const { data: tokenVerification, error: tokenError, isLoading: isVerifyingToken } = useVerifyTokenQuery(
  //   undefined, 
  //   { 
  //     skip: !isAuthenticated || !token,
  //     refetchOnMountOrArgChange: false,
  //     refetchOnFocus: false,
  //     refetchOnReconnect: false,
  //   }
  // );

  // // Handle token verification results - only if there's an actual error response
  // useEffect(() => {
  //   if (tokenError && isAuthenticated && !isVerifyingToken) {
  //     const errorStatus = (tokenError as any)?.status;
  //     // Only logout on specific auth errors (401, 403)
  //     if (errorStatus === 401 || errorStatus === 403) {
  //       console.log('Token verification failed with auth error, logging out user');
  //       dispatch(logout());
  //       dispatch(showSnackbar({ 
  //         message: 'Your session has expired. Please login again.', 
  //         type: 'error' 
  //       }));
  //     }
  //   }
  // }, [tokenError, isAuthenticated, isVerifyingToken, dispatch]);

  // Check if user has any form of location data (user addresses, store location, or access granted)
  const hasLocationData = () => {
    return hasAnyLocationAccess(user, userLocation, hasLocationAccess);
  };

  // Check if current route requires location
  const isLocationRequiredRoute = () => {
    const locationRequiredRoutes = ['(tabs)', 'home'];
    return locationRequiredRoutes.some(route => 
      segments.some(segment => segment.includes(route))
    );
  };

  // Check if user is new and needs location setup
  const isNewUserNeedingLocation = () => {
    if (!user) return false;
    
    const isNewAccount = user.createdAt && 
      (new Date().getTime() - new Date(user.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
    
    const hasNoLocationData = !user.addresses?.length && !hasLocationAccess && !userLocation;
    
    return isNewAccount && hasNoLocationData;
  };

  // Navigation guard - redirect if location is required but not available
  useEffect(() => {
    // Show location modal for location-required routes regardless of authentication status
    if (isLocationRequiredRoute() && !hasLocationData() && !hasLocationAccess) {
      setLocationRequired(true);
      setShowLocationModal(true);
    } else {
      setLocationRequired(false);
    }
  }, [isAuthenticated, segments, user, hasLocationAccess, userLocation]);

  // Proactive location modal for new users
  useEffect(() => {
    if (isNewUserNeedingLocation() && isAuthenticated) {
      const timer = setTimeout(() => {
        setShowLocationModal(true);
        setLocationRequired(false); // Not strictly required, but encouraged
      }, 2000); // Show after 2 seconds for new users

      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, hasLocationAccess, userLocation]);

  // Load user location into product store when available
  useEffect(() => {
    if (user && hasLocationData()) {
      const currentLocation = getUserCurrentLocation(user);
      if (currentLocation) {
        dispatch(setUserLocation(currentLocation));
      }
    }
  }, [user, dispatch]);

  // Show location modal for users without location access
  useEffect(() => {
    // Show location modal for users without location data or access, regardless of authentication
    if (!hasLocationData() && !hasLocationAccess) {
      const timer = setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, hasLocationAccess, userLocation]);

  const handleLocationRequest = async (): Promise<void> => {
    try {
      const hasPermission = await requestLocationPermission();      
      if (hasPermission) {
        const location = await getCurrentLocation();
        
        if (location) {
          try {
            // Update product store with user location for all users
            dispatch(setUserLocation(location));
            
            // Only update user data via API if user is authenticated
            if (isAuthenticated && user) {
              const result = await updateLocation({
                lat: location.lat,
                lng: location.lng,
              }).unwrap();
              
              // Add location to user's default address if they don't have any
              if (!user.addresses || user.addresses.length === 0) {
                const newAddress = {
                  label: 'Current Location',
                  street: '',
                  city: '',
                  state: '',
                  pincode: '',
                  location: {
                    lat: location.lat,
                    lng: location.lng,
                  },
                };
                
                dispatch(updateUserData({
                  addresses: [newAddress],
                }));
              }
            }
            
            // Mark location as accessed for all users (authenticated or not)
            dispatch(setLocationAccess(true));
            
            dispatch(showSnackbar({ 
              message: 'Location updated successfully!', 
              type: 'success' 
            }));
            
            setShowLocationModal(false);
          } catch (apiError) {
            console.error('API error:', apiError);
            // For unauthenticated users, still allow location access even if API fails
            if (!isAuthenticated) {
              dispatch(setLocationAccess(true));
              setShowLocationModal(false);
              dispatch(showSnackbar({ 
                message: 'Location access granted!', 
                type: 'success' 
              }));
            } else {
              dispatch(showSnackbar({ 
                message: 'Failed to update location on server. Please try again.', 
                type: 'error' 
              }));
            }
          }
        } else {
          dispatch(showSnackbar({ 
            message: 'Could not get current location. Please try again.', 
            type: 'error' 
          }));
        }
      } else {
        console.log('Permission denied');
        dispatch(showSnackbar({ 
          message: 'Location permission is required to continue', 
          type: 'error' 
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      dispatch(showSnackbar({ 
        message: 'Failed to update location. Please try again.', 
        type: 'error' 
      }));
    }
  };

  const handleSnackbarHide = () => {
    dispatch(hideSnackbar());
  };

  return (
    <View style={styles.container}>
      {children}
      
      {/* Global Snackbar */}
      <Snackbar
        visible={visible}
        message={message}
        type={type}
        onHide={handleSnackbarHide}
      />
      
      {/* Location Access Modal */}
      <LocationModal
        visible={showLocationModal}
        onRequestLocation={handleLocationRequest}
        loading={isUpdatingLocation}
        required={locationRequired}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});