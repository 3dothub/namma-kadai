import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { currentTheme } from '../constants/Colors';

interface LocationModalProps {
  visible: boolean;
  onRequestLocation: () => Promise<void>;
  onSkip?: () => void;
  loading?: boolean;
  required?: boolean;
}

const { width, height } = Dimensions.get('window');

export const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onRequestLocation,
  onSkip,
  loading = false,
  required = false,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestLocation = async () => {
    setIsRequesting(true);
    try {
      await onRequestLocation();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={currentTheme.primary}
                />
              </View>
              <Text style={styles.title}>
                {required ? 'Location Required' : 'Enable Locationssss'}
              </Text>
              <Text style={styles.subtitle}>
                {required 
                  ? 'Location access is required to view nearby stores and products in your area'
                  : 'Help us find stores and services near you for a better shopping experience'
                }
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              <View style={styles.benefit}>
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={currentTheme.primary}
                />
                <Text style={styles.benefitText}>Find nearby stores</Text>
              </View>
              <View style={styles.benefit}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={currentTheme.primary}
                />
                <Text style={styles.benefitText}>Faster delivery estimates</Text>
              </View>
              <View style={styles.benefit}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={currentTheme.primary}
                />
                <Text style={styles.benefitText}>Location-based offers</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isRequesting || loading) && styles.buttonDisabled,
                ]}
                onPress={handleRequestLocation}
                disabled={isRequesting || loading}
              >
                {isRequesting || loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="location" size={18} color="#fff" />
                    <Text style={styles.primaryButtonText}>Allow Location</Text>
                  </>
                )}
              </TouchableOpacity>

              {onSkip && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onSkip}
                  disabled={isRequesting || loading}
                >
                  <Text style={styles.secondaryButtonText}>
                    {required ? 'Go Back' : 'Maybe Later'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Privacy Note */}
            <Text style={styles.privacyNote}>
              Your location data is encrypted and used only to improve your shopping experience
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${currentTheme.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: currentTheme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: currentTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefits: {
    marginBottom: 32,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: currentTheme.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
  actions: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: currentTheme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: currentTheme.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: currentTheme.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  privacyNote: {
    fontSize: 12,
    color: currentTheme.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
