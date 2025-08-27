import { Provider } from 'react-redux';
import { store } from '../store';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { useRouter, useSegments } from 'expo-router';

function Root() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inProtectedGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  );
}
