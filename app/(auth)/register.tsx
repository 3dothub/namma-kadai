import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useRegisterMutation } from '../../store/api/authApi';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { Snackbar } from '../../components/Snackbar';
import { SocialButton } from '../../components/SocialButton';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();

  // Check if passwords match and both are filled
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const shouldShowConfirmPassword = password.length > 0 && !passwordsMatch;

  const handleRegister = async () => {
    // Auto-set confirmPassword if passwords match and confirmPassword is empty
    const finalConfirmPassword = passwordsMatch ? password : confirmPassword;
    
    if (!name || !email || !password) {
      setSnackbar({ visible: true, message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (!passwordsMatch && !finalConfirmPassword) {
      setSnackbar({ visible: true, message: 'Please confirm your password', type: 'error' });
      return;
    }

    if (password !== finalConfirmPassword) {
      setSnackbar({ visible: true, message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setSnackbar({ visible: true, message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    try {
      dispatch(loginStart());
      const response = await register({ name, email, password }).unwrap();
      dispatch(loginSuccess({ user: response.user, token: response.token }));
      // Use backend success message
      const successMessage = response.message || 'Registration successful!';
      setSnackbar({ visible: true, message: successMessage, type: 'success' });
      setTimeout(() => router.replace('/(tabs)/home'), 1500);
    } catch (error: any) {
      // Use backend error message
      const errorMessage = error?.data?.message || error?.message || 'Registration failed';
      dispatch(loginFailure(errorMessage));
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
  <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={() => setSnackbar({ ...snackbar, visible: false })}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@gmail.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#4ade80" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Only show confirm password if passwords don't match or if it's empty */}
            {(!passwordsMatch || shouldShowConfirmPassword) && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye" : "eye-off"} 
                      size={20} 
                      color="#4ade80" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Section - This will be pushed down properly */}
          <View style={styles.socialSection}>
            <View style={styles.orSection}>
              <Text style={styles.orText}>Or Sign up with</Text>
            </View>
            <View style={styles.socialButtons}>
              <SocialButton provider="facebook" />
              <SocialButton provider="google" />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/(auth)/login">
                <Text style={styles.signInLink}>Sign In</Text>
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4ade80',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    color: '#374151',
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordContainer: {
    position: 'relative',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 18,
    paddingRight: 50,
    fontSize: 16,
    color: '#374151',
    borderWidth: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  passwordMatchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordMatchText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#4ade80',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  orSection: {
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  orText: {
    fontSize: 14,
    color: '#9ca3af',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  footerText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signInLink: {
    color: '#4ade80',
    fontWeight: '600',
  },
});
