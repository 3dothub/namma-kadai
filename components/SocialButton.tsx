import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonProps {
  provider: 'facebook' | 'google';
  onPress?: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert(
        'Coming Soon',
        `${provider === 'facebook' ? 'Facebook' : 'Google'} login will be available soon!`
      );
    }
  };

  const getIcon = () => {
    switch (provider) {
      case 'facebook':
        return <Ionicons name="logo-facebook" size={24} color="#1877f2" />;
      case 'google':
        return <Ionicons name="logo-google" size={24} color="#ea4335" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={styles.socialButton} onPress={handlePress}>
      {getIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
});
