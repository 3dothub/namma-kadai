import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hasUserLocationData } from '../utils/locationUtils';

export default function Index() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // If user is authenticated and has location data, go directly to home
  if (isAuthenticated && user && hasUserLocationData(user)) {
    return <Redirect href="/(tabs)/home" />;
  }
  
  // Otherwise, show welcome screen
  return <Redirect href="/welcome" />;
}
