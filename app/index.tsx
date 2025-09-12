import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Index() {
  const { currentLocation, hasCompletedWelcome, hasLocationAccess } = useSelector((state: RootState) => state.auth);
  const { userLocation } = useSelector((state: RootState) => state.products);
  
  // Check if user has location data from either authSlice or productSlice  
  const hasLocation = !!(currentLocation || userLocation || hasLocationAccess);
  
  // If user hasn't completed welcome, show welcome page
  if (!hasCompletedWelcome) {
    return <Redirect href="/welcome" />;
  }
  
  // If welcome is completed and has location, go to home
  if (hasCompletedWelcome && hasLocation) {
    return <Redirect href="/(tabs)/home" />;
  }
  
  // If welcome is completed but no location, still go to home (location modal will show via AppWrapper)
  return <Redirect href="/(tabs)/home" />;
}
