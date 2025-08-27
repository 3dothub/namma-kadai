import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SnackBarProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onHide: () => void;
}

export const SnackBar: React.FC<SnackBarProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
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
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
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
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <SafeAreaView edges={['top']}>
        <View
          style={{
            backgroundColor,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name={iconName} size={20} color="#fff" style={{ marginRight: 12 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', flex: 1 }}>
            {message}
          </Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};
