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
  const emojiScale = useRef(new Animated.Value(0.5)).current;
  const emojiRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation - slide down from top with emoji animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Emoji bounce animation
        Animated.sequence([
          Animated.timing(emojiScale, {
            toValue: 1.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(emojiScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Emoji rotation animation
        Animated.timing(emojiRotate, {
          toValue: 1,
          duration: 800,
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

  const backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  const iconName: 'checkmark-circle' | 'alert-circle' | 'information-circle' = 
    type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';

  // Extract emojis from message for animation
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojis = message.match(emojiRegex) || [];
  const messageWithoutEmojis = message.replace(emojiRegex, '').trim();

  const rotateInterpolation = emojiRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
            paddingTop: insets.top + 20,
            paddingBottom: 20,
          }
        ]}
      >
        <View style={styles.content}>
          {/* Animated Emojis */}
          {emojis.length > 0 && (
            <View style={styles.emojiContainer}>
              {emojis.slice(0, 4).map((emoji, index) => (
                <Animated.Text
                  key={index}
                  style={[
                    styles.emoji,
                    {
                      transform: [
                        { scale: emojiScale },
                        { rotate: index % 2 === 0 ? rotateInterpolation : '0deg' },
                      ],
                    },
                  ]}
                >
                  {emoji}
                </Animated.Text>
              ))}
            </View>
          )}
          
          {/* Icon */}
          <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
          
          {/* Message */}
          <Text style={styles.message}>
            {messageWithoutEmojis || message}
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
  emojiContainer: {
    flexDirection: 'row',
    marginRight: 8,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginHorizontal: 2,
  },
});
