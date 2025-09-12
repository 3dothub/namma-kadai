import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { RootState } from '../store';
import { Snackbar } from './Snackbar';
import { LocationModal } from './LocationModal';
import { setLocationAccess, updateUserData, setCurrentLocation } from '../store/slices/authSlice';
import { setUserLocation } from '../store/slices/productSlice';
import { showSnackbar, hideSnackbar } from '../store/slices/snackbarSlice';
import { useUpdateLocationMutation } from '../store/api/userApi';
import { getCurrentLocationWithAddress, requestLocationPermission } from '../services/locationService';
import { getUserCurrentLocation, hasAnyLocationAccess } from '../utils/locationUtils';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const dispatch = useDispatch();
  const segments = useSegments();
  
  const { visible, message, type } = useSelector((state: RootState) => state.snackbar);
  const { user, isAuthenticated, hasLocationAccess, currentLocation, hasCompletedWelcome } = useSelector((state: RootState) => state.auth);
  const { userLocation } = useSelector((state: RootState) => state.products);
  
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);

  const hasLocationData = () => {
    // Check for location in authSlice first, then fallback to productSlice and other sources
    return !!(currentLocation || hasAnyLocationAccess(user, userLocation, hasLocationAccess));
  };

  const isLocationRequiredRoute = () => {
    const locationRequiredRoutes = ['(tabs)', 'home'];
    return locationRequiredRoutes.some(route => 
      segments.some(segment => segment.includes(route))
    );
  };

  const isOnWelcomePage = () => {
    return segments.includes('welcome');
  };

  const isNewUserNeedingLocation = () => {
    if (!user) return false;
    
    const isNewAccount = user.createdAt && 
      (new Date().getTime() - new Date(user.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000);
    const hasNoLocationData = !user.addresses?.length && !hasLocationAccess && !userLocation && !currentLocation;
    
    return isNewAccount && hasNoLocationData;
  };

  // Only show location modal if:
  // 1. Not on welcome page (welcome page handles its own location modal)
  // 2. User is on a location-required route and has no location data
  // 3. OR if it's a new user needing location after authentication
  useEffect(() => {
    if (isOnWelcomePage()) {
      setShowLocationModal(false);
      return;
    }

    if (isLocationRequiredRoute() && !hasLocationData() && hasCompletedWelcome) {
      setLocationRequired(true);
      setShowLocationModal(true);
    } else {
      setLocationRequired(false);
    }
  }, [isAuthenticated, segments, user, hasLocationAccess, userLocation, currentLocation, hasCompletedWelcome]);

  useEffect(() => {
    if (!isOnWelcomePage() && isNewUserNeedingLocation() && isAuthenticated) {
      const timer = setTimeout(() => {
        setShowLocationModal(true);
        setLocationRequired(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, hasLocationAccess, userLocation, currentLocation]);

  // Sync location data between auth and product slices
  useEffect(() => {
    if (currentLocation && !userLocation) {
      dispatch(setUserLocation(currentLocation));
    } else if (user && hasLocationData()) {
      const currentUserLocation = getUserCurrentLocation(user);
      if (currentUserLocation && !currentLocation) {
        dispatch(setCurrentLocation(currentUserLocation));
      }
    }
  }, [user, currentLocation, userLocation, dispatch]);

  const handleLocationRequest = async (): Promise<void> => {
    try {
      const hasPermission = await requestLocationPermission();      
      if (hasPermission) {
        const location = await getCurrentLocationWithAddress({
          timeout: 15000,
          enableHighAccuracy: true,
          showSnackbar: (message, type) => dispatch(showSnackbar({ message, type }))
        });
        
        if (location) {
          try {
            // Store location in auth slice
            dispatch(setCurrentLocation(location));
            dispatch(setUserLocation(location));
            
            if (isAuthenticated && user) {
              const result = await updateLocation({
                lat: location.lat,
                lng: location.lng,
              }).unwrap();
              
              if (!user.addresses || user.addresses.length === 0) {
                const newAddress = {
                  label: 'Current Location',
                  street: location.address?.street || '',
                  city: location.address?.city || '',
                  state: location.address?.region || '',
                  pincode: location.address?.postalCode || '',
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
            
            dispatch(setLocationAccess(true));
            
            dispatch(showSnackbar({ 
              message: 'Location updated successfully!', 
              type: 'success' 
            }));
            
            setShowLocationModal(false);
          } catch (apiError) {
            console.error('API error:', apiError);
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
      
      <Snackbar
        visible={visible}
        message={message}
        type={type}
        onHide={handleSnackbarHide}
      />
      
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