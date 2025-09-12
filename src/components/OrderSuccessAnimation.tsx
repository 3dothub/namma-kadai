import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface OrderSuccessAnimationProps {
  visible: boolean;
  onAnimationComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export const OrderSuccessAnimation: React.FC<OrderSuccessAnimationProps> = ({
  visible,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000), // Show for 2 seconds
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete();
      });
    }
  }, [visible, scaleAnim, opacityAnim, onAnimationComplete]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Success Icon with Pulse Animation */}
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1500}
            style={styles.emojiContainer}
          >
            <Text style={styles.successEmoji}>🎉</Text>
          </Animatable.View>
          
          {/* Celebration Emojis */}
          <View style={styles.celebrationContainer}>
            <Animatable.Text
              animation="bounceIn"
              delay={200}
              style={[styles.celebrationEmoji, styles.emoji1]}
            >
              ✨
            </Animatable.Text>
            <Animatable.Text
              animation="bounceIn"
              delay={400}
              style={[styles.celebrationEmoji, styles.emoji2]}
            >
              🎊
            </Animatable.Text>
            <Animatable.Text
              animation="bounceIn"
              delay={600}
              style={[styles.celebrationEmoji, styles.emoji3]}
            >
              🎈
            </Animatable.Text>
            <Animatable.Text
              animation="bounceIn"
              delay={800}
              style={[styles.celebrationEmoji, styles.emoji4]}
            >
              ⭐
            </Animatable.Text>
          </View>

          {/* Success Text */}
          <Animatable.View
            animation="fadeInUp"
            delay={500}
            style={styles.textContainer}
          >
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSubtitle}>
              Your order has been successfully placed
            </Text>
          </Animatable.View>

          {/* Checkmark Animation */}
          <Animatable.View
            animation="bounceIn"
            delay={300}
            style={styles.checkmarkContainer}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animatable.View>
        </Animated.View>
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
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 40,
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  emojiContainer: {
    marginBottom: 20,
  },
  successEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  celebrationContainer: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 40,
    position: 'absolute',
  },
  emoji1: {
    top: -100,
    left: -80,
  },
  emoji2: {
    top: -120,
    right: -60,
  },
  emoji3: {
    bottom: -100,
    left: -100,
  },
  emoji4: {
    bottom: -80,
    right: -80,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  checkmarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkmark: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
