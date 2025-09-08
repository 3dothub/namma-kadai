import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useRegisterMutation } from '../../store/api/authApi';
import { useUpdateLocationMutation } from '../../store/api/userApi';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { showSnackbar } from '../../store/slices/snackbarSlice';
import { Ionicons } from '@expo/vector-icons';
import { currentTheme } from '../../constants/Colors';
import { sharedStyles } from '../../constants/SharedStyles';
import { getCurrentLocation, requestLocationPermission } from '../../services/locationService';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const [register, { isLoading }] = useRegisterMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const dispatch = useDispatch();

  // Check if passwords match
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleLocationAccess = async (): Promise<void> => {
    try {
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission) {
        const location = await getCurrentLocation();
        
        if (location) {
          await updateLocation({
            lat: location.lat,
            lng: location.lng,
          }).unwrap();
          
          dispatch(showSnackbar({ 
            message: 'Location updated successfully!', 
            type: 'success' 
          }));
        } else {
          dispatch(showSnackbar({ 
            message: 'Could not get current location', 
            type: 'info' 
          }));
        }
      } else {
        dispatch(showSnackbar({ 
          message: 'Location permission denied', 
          type: 'info' 
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      dispatch(showSnackbar({ 
        message: 'Failed to update location', 
        type: 'error' 
      }));
    }
  };

  const showLocationPermissionDialog = (): void => {
    Alert.alert(
      'Location Access',
      'We need access to your location to provide better services and find nearby stores.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => {
            // Proceed to home without location
            router.replace('/(tabs)/home');
          }
        },
        {
          text: 'Allow',
          onPress: async () => {
            await handleLocationAccess();
            router.replace('/(tabs)/home');
          }
        }
      ]
    );
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      dispatch(showSnackbar({ message: 'Please fill in all fields', type: 'error' }));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(showSnackbar({ message: 'Passwords do not match', type: 'error' }));
      return;
    }

    if (password.length < 6) {
      dispatch(showSnackbar({ message: 'Password must be at least 6 characters', type: 'error' }));
      return;
    }

    try {
      dispatch(loginStart());
      const response = await register({ name, email, password }).unwrap();
      dispatch(loginSuccess({ user: response.user, token: response.token }));
      const successMessage = response.message || 'Registration successful!';
      dispatch(showSnackbar({ message: successMessage, type: 'success' }));
      
      // Show location permission dialog after successful registration
      setTimeout(() => {
        showLocationPermissionDialog();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Registration failed';
      dispatch(loginFailure(errorMessage));
      dispatch(showSnackbar({ message: errorMessage, type: 'error' }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <SafeAreaView style={sharedStyles.content} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={sharedStyles.header}>
              <Text style={styles.title}>Sign up</Text>
            </View>

              {/* Form Section */}
              <View style={sharedStyles.form}>
                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.label}>Name</Text>
                  <View style={[sharedStyles.inputContainer, nameFocused && sharedStyles.inputContainerActive]}>
                    <Ionicons name="person-outline" size={18} color={currentTheme.textTertiary} style={sharedStyles.inputIcon} />
                    <TextInput
                      style={sharedStyles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor={currentTheme.inputPlaceholder}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      autoCapitalize="words"
                      autoCorrect={false}
                      multiline={false}
                      scrollEnabled={false}
                      textAlignVertical="center"
                    />
                  </View>
                </View>

                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.label}>Email</Text>
                  <View style={[sharedStyles.inputContainer, emailFocused && sharedStyles.inputContainerActive]}>
                    <Ionicons name="mail-outline" size={18} color={currentTheme.textTertiary} style={sharedStyles.inputIcon} />
                    <TextInput
                      style={sharedStyles.input}
                      placeholder="demo@email.com"
                      placeholderTextColor={currentTheme.inputPlaceholder}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      multiline={false}
                      scrollEnabled={false}
                      textAlignVertical="center"
                    />
                  </View>
                </View>

                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.label}>Password</Text>
                  <View style={[sharedStyles.inputContainer, passwordFocused && sharedStyles.inputContainerActive]}>
                    <Ionicons name="lock-closed-outline" size={18} color={currentTheme.textTertiary} style={sharedStyles.inputIcon} />
                    <TextInput
                      style={sharedStyles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={currentTheme.inputPlaceholder}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      multiline={false}
                      scrollEnabled={false}
                      textAlignVertical="center"
                    />
                    <TouchableOpacity
                      style={sharedStyles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye" : "eye-off"} 
                        size={18} 
                        color={currentTheme.textTertiary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.label}>Confirm Password</Text>
                  <View style={[sharedStyles.inputContainer, confirmPasswordFocused && sharedStyles.inputContainerActive]}>
                    <Ionicons name="lock-closed-outline" size={18} color={currentTheme.textTertiary} style={sharedStyles.inputIcon} />
                    <TextInput
                      style={sharedStyles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor={currentTheme.inputPlaceholder}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                      secureTextEntry={!showConfirmPassword}
                      multiline={false}
                      scrollEnabled={false}
                      textAlignVertical="center"
                    />
                    <TouchableOpacity
                      style={sharedStyles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye" : "eye-off"} 
                        size={18} 
                        color={currentTheme.textTertiary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[sharedStyles.primaryButton, isLoading && sharedStyles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <Text style={sharedStyles.buttonText}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={sharedStyles.footer}>
                <View style={styles.footerContent}>
                  <View style={styles.socialButtonsContainer}>
                    <View style={styles.socialButtonLeftContainer}>
                      <TouchableOpacity style={styles.socialButtonLeft}>
                        <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.greyText}>
                      {"   or continue with   "}
                    </Text>
                    <View style={styles.socialButtonRightContainer}>
                      <TouchableOpacity style={styles.socialButtonRight}>
                        <Ionicons name="logo-google" size={24} color="#ea4335" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={sharedStyles.footerText}>
                    Already have an Account? {' '}
                    <Link href="/(auth)/login">
                      <Text style={sharedStyles.linkText}>Login</Text>
                    </Link>
                  </Text>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Full white background
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: currentTheme.textPrimary,
    marginBottom: 32,
    textAlign: 'left', // Left align
  },
  footerContent: {
    width: '100%',
  },
  greyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  socialButtonLeftContainer: {
    alignItems: 'flex-start',
  },
  socialButtonRightContainer: {
    alignItems: 'flex-end',
  },
  socialButtonLeft: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  socialButtonRight: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
});
