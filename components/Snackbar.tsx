import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, Platform, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SnackBarProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
}

export const Snackbar: React.FC<SnackBarProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation - slide down from top
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideSnackBar();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideSnackBar();
    }
  }, [visible]);

  const hideSnackBar = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
  const iconName: 'checkmark-circle' | 'alert-circle' = type === 'success' ? 'checkmark-circle' : 'alert-circle';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        }
      ]}
    >
      <View
        style={[
          styles.snackbar,
          {
            backgroundColor,
            paddingTop: insets.top + 16,
            paddingBottom: 16,
          }
        ]}
      >
        <View style={styles.content}>
          <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
          <Text style={styles.message}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  snackbar: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
});
