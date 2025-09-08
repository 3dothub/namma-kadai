import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { currentTheme } from '../constants/Colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={currentTheme.background} barStyle="dark-content" />
      
      <SafeAreaView style={styles.content}>
        {/* Main Content - Push to bottom */}
        <View style={styles.mainContent}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Lorem ipsum dolor sit amet, consectetur{'\n'}
              adipiscing elit.
            </Text>
          </View>
          
          {/* Bottom Links */}
          <View style={styles.bottomLinksContainer}>
            <Pressable 
              style={styles.linkButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
            
            <Pressable 
              style={styles.linkButtonPrimary}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.linkTextPrimary}>Explore</Text>
              <Ionicons name="arrow-forward" size={20} color={currentTheme.primary} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Full white background
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-end', // Push content to bottom
  },
  textContainer: {
    alignItems: 'flex-start', // Left align as requested
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: currentTheme.textPrimary,
    marginBottom: 32,
    textAlign: 'left', // Left align
  },
  subtitle: {
    fontSize: 16,
    color: currentTheme.textSecondary,
    lineHeight: 24,
    textAlign: 'left', // Left align
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 18,
    fontWeight: '500',
    color: currentTheme.textSecondary,
  },
  linkButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  linkTextPrimary: {
    fontSize: 18,
    fontWeight: '600',
    color: currentTheme.primary,
  },
});
