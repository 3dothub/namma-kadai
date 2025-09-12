import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderSuccessModalProps {
  visible: boolean;
  onNavigateHome: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  visible,
  onNavigateHome,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  console.log('OrderSuccessModal rendered, visible:', visible);

  useEffect(() => {
    console.log('OrderSuccessModal useEffect triggered, visible:', visible);
    if (visible) {
      console.log('Modal visible, starting animations...');
      // Start animations
      Animated.sequence([
        // Scale in the modal
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        // Show checkmark
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Show confetti effect
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto navigate after 3 seconds
      const timer = setTimeout(() => {
        onNavigateHome();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      checkmarkAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  console.log('About to render modal, visible:', visible);

  if (!visible) {
    console.log('Modal not visible, returning null');
    return null;
  }

  console.log('Modal is visible, rendering...');

  // Simple version for testing
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      style={{ zIndex: 9999 }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22C55E', marginBottom: 20 }}>
            🎉 Order Success! �
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
            Your order has been placed successfully!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onNavigateHome}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10000,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  confetti: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    height: 100,
  },
  confettiEmoji: {
    position: 'absolute',
    fontSize: 24,
    top: 0,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
