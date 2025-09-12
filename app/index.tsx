import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { hasAnyLocationAccess } from '@/utils/locationUtils';

export default function Index() {
  const { isAuthenticated, user, hasLocationAccess } = useSelector((state: RootState) => state.auth);
  const { userLocation } = useSelector((state: RootState) => state.products);
  
  // Check if user has any form of location access
  const hasLocation = hasAnyLocationAccess(user, userLocation, hasLocationAccess);
  
  // If user has location data, go directly to home
  if (hasLocation) {
    return <Redirect href="/(tabs)/home" />;
  }
  
  // Otherwise, show welcome screen
  return <Redirect href="/welcome" />;
}
