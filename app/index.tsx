import { Redirect } from 'expo-router';

export default function Index() {
  // Always redirect to home - login only required when user tries to checkout
  return <Redirect href="/(tabs)/home" />;
}
