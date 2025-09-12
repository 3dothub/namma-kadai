import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationRequestScreenProps {
  isRequestingLocation: boolean;
  isAuthenticated: boolean;
  onLocationRequest: () => void;
  onSignIn: () => void;
}

export const LocationRequestScreen: React.FC<LocationRequestScreenProps> = ({
  isRequestingLocation,
  isAuthenticated,
  onLocationRequest,
  onSignIn,
}) => {
  return (
    <View style={styles.loadingContainer}>
      <Ionicons name="location-outline" size={64} color="#22C55E" style={{ marginBottom: 16 }} />
      <Text style={styles.loadingText}>
        {isRequestingLocation ? 'Getting your location...' : 'Location Access Required'}
      </Text>
      <Text style={styles.loadingSubtext}>
        {isRequestingLocation 
          ? 'Please wait while we get your current location'
          : 'We need your location to show nearby vendors and products'
        }
      </Text>
      {!isRequestingLocation && (
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={onLocationRequest}
        >
          <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.locationButtonText}>Allow Location Access</Text>
        </TouchableOpacity>
      )}
      {!isAuthenticated && !isRequestingLocation && (
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={onSignIn}
        >
          <Text style={styles.signInButtonText}>Or Sign In to Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  signInButtonText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
