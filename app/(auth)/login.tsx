import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAppDispatch } from '../../hooks/useRedux';
import { useLoginMutation } from '../../services/authApi';
import { setCredentials as setAuthCredentials } from '../../store/slices/authSlice';
import { Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Snackbar } from '../../components/Snackbar';
import { Header } from '../../components/Header';
import { ApiTest } from '../../components/ApiTest';
import { API_URL } from '@env';

export default function Login() {
  const dispatch = useAppDispatch();
  const [login, { isLoading, error, data }] = useLoginMutation();
  const [credentials, setCredentialsState] = useState({
    email: '',
    password: '',
  });

  // const handleLogin = async () => {
  //   try {
  //     await login(credentials);
  //   } catch (err) {
  //   }
  // };
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  // Handle success
  useEffect(() => {
    if (data?.user && data?.token) {
      dispatch(setAuthCredentials({ user: data.user, token: data.token }));
      setSnackbar({
        visible: true,
        message: `Welcome back, ${data.user.name}!`,
        type: 'success',
      });
      // Navigate after a short delay
      setTimeout(() => router.replace('/(tabs)/home'), 1000);
    }
  }, [data]);

  // Handle API error
  useEffect(() => {
    if (error && typeof error === 'object' && error !== null && 'data' in error) {
      const apiError = error as { data?: { message?: string } };
      setSnackbar({
        visible: true,
        message: apiError.data?.message || 'Login failed',
        type: 'error',
      });
    }
  }, [error]);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      setSnackbar({
        visible: true,
        message: 'Please fill in all fields',
        type: 'info',
      });
      return;
    }

    console.log('Attempting login with credentials:', { email: credentials.email, password: '***' });
    
    try {
      const result = await login(credentials).unwrap();
      console.log('Login successful:', result);
      if (result?.token && result?.user) {
        dispatch(setAuthCredentials({ user: result.user, token: result.token }));
        setSnackbar({
          visible: true,
          message: `Welcome back, ${result.user.name}!`,
          type: 'success',
        });
        // Navigate after a short delay
        setTimeout(() => router.replace('/(tabs)/home'), 1000);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.data?.message || 
                     (error.status === 'FETCH_ERROR' ? 'Network error. Please check your connection.' : 'Login failed');
      setSnackbar({
        visible: true,
        message: message,
        type: 'error',
      });
    }
  };  return (
    <View style={styles.container}>
      <Header title="Login" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <ApiTest />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={credentials.email}
              onChangeText={(text) => setCredentialsState(prev => ({ ...prev, email: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={credentials.password}
              onChangeText={(text) => setCredentialsState(prev => ({ ...prev, password: text }))}
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            <Link href="/register" style={styles.link}>
              Don't have an account? Register
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8F9',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#0066FF',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#99C2FF' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 16, color: '#0066FF', textAlign: 'center', fontSize: 15 },
});
