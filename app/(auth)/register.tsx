import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { useRegisterMutation } from '../../services/authApi';
import { setCredentials as setAuthCredentials } from '../../store/slices/authSlice';
import { Header } from '../../components/Header';
import { Snackbar } from '../../components/Snackbar';

export default function Register() {
  const dispatch = useAppDispatch();
  const [register, { isLoading, error, data }] = useRegisterMutation();
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  useEffect(() => {
    if (error) {
      setSnackbar({
        visible: true,
        message: 'Registration failed. Please try again.',
        type: 'error'
      });
    }
    if (data) {
      dispatch(setAuthCredentials(data));
      setSnackbar({
        visible: true,
        message: 'Registration successful!',
        type: 'success'
      });
      setTimeout(() => router.replace('/(tabs)/home'), 1000);
    }
  }, [error, data]);

  const handleRegister = () => {
    // Validate inputs
    if (!credentials.name || !credentials.email || !credentials.password || !credentials.confirmPassword) {
      setSnackbar({
        visible: true,
        message: 'Please fill in all fields',
        type: 'info'
      });
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      setSnackbar({
        visible: true,
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }
    console.log("credentials", credentials);

    // Call register mutation
    register({
      name: credentials.name,
      email: credentials.email,
      password: credentials.password
    }).unwrap()
      .catch(error => {
        console.log("Registration error", error);
        let errorMessage = 'Registration failed';
        
        if (error.status === 'FETCH_ERROR') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        }
        
        setSnackbar({
          visible: true,
          message: errorMessage,
          type: 'error'
        });
      });
  };

  return (
    <View style={styles.container}>
      <Header title="Register" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              autoCapitalize="words"
              value={credentials.name}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={credentials.email}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, email: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={credentials.password}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={credentials.confirmPassword}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, confirmPassword: text }))}
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>
            <Link href="/login" style={styles.link}>
              Already have an account? Login
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
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
  buttonDisabled: {
    backgroundColor: '#99C2FF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 16,
    color: '#0066FF',
    textAlign: 'center',
    fontSize: 15,
  },
});
