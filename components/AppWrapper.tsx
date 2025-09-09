import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSegments } from 'expo-router';
import { RootState } from '../store';
import { Snackbar } from './Snackbar';
import { LocationModal } from './LocationModal';
import { setLocationAccess, updateUserData } from '../store/slices/authSlice';
import { setUserLocation } from '../store/slices/productSlice';
import { showSnackbar, hideSnackbar } from '../store/slices/snackbarSlice';
import { useUpdateLocationMutation } from '../store/api/userApi';
import { getCurrentLocation, requestLocationPermission } from '../services/locationService';
import { hasUserLocationData, getUserCurrentLocation } from '../utils/locationUtils';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  
  const { visible, message, type } = useSelector((state: RootState) => state.snackbar);
  const { user, isAuthenticated, hasLocationAccess } = useSelector((state: RootState) => state.auth);
  
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);

  // Check if user has location data
  const hasLocationData = () => {
    return hasUserLocationData(user);
  };

  // Check if current route requires location
  const isLocationRequiredRoute = () => {
    const locationRequiredRoutes = ['(tabs)', 'home'];
    return locationRequiredRoutes.some(route => 
      segments.some(segment => segment.includes(route))
    );
  };

  // Navigation guard - redirect if location is required but not available
  useEffect(() => {
    if (isAuthenticated && isLocationRequiredRoute() && !hasLocationData()) {
      setLocationRequired(true);
      setShowLocationModal(true);
    } else {
      setLocationRequired(false);
    }
  }, [isAuthenticated, segments, user]);

  // Load user location into product store when available
  useEffect(() => {
    if (user && hasLocationData()) {
      const currentLocation = getUserCurrentLocation(user);
      if (currentLocation) {
        dispatch(setUserLocation(currentLocation));
      }
    }
  }, [user, dispatch]);

  // Show location modal for authenticated users without location on dashboard access
  useEffect(() => {
    if (isAuthenticated && !hasLocationData() && !hasLocationAccess) {
      const timer = setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, hasLocationAccess]);

  const handleLocationRequest = async (): Promise<void> => {
    try {
      console.log('Requesting location permission...');
      const hasPermission = await requestLocationPermission();
      console.log('Permission granted:', hasPermission);
      
      if (hasPermission) {
        console.log('Getting current location...');
        const location = await getCurrentLocation();
        console.log('Location received:', location);
        
        if (location) {
          try {
            console.log('Updating location via API...');
            // Update location via API
            const result = await updateLocation({
              lat: location.lat,
              lng: location.lng,
            }).unwrap();
            console.log('API update successful:', result);
            
            // Update local state to mark location as accessed
            dispatch(setLocationAccess(true));
            
            // Update product store with user location
            dispatch(setUserLocation(location));
            
            // Add location to user's default address if they don't have any
            if (user && (!user.addresses || user.addresses.length === 0)) {
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
              
              console.log('Adding location to user addresses...');
              dispatch(updateUserData({
                addresses: [newAddress],
              }));
            }
            
            dispatch(showSnackbar({ 
              message: 'Location updated successfully!', 
              type: 'success' 
            }));
            
            setShowLocationModal(false);
          } catch (apiError) {
            console.error('API error:', apiError);
            dispatch(showSnackbar({ 
              message: 'Failed to update location on server. Please try again.', 
              type: 'error' 
            }));
          }
        } else {
          console.log('Could not get location');
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