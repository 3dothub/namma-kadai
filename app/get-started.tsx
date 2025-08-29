import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f0f9f0', '#e8f5e8', '#ffffff']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationBackground}>
              {/* Woman with groceries illustration */}
              <View style={styles.womanContainer}>
                <View style={styles.woman}>
                  {/* Face */}
                  <View style={styles.face}>
                    <View style={styles.hair} />
                    <View style={styles.faceShape} />
                    <View style={styles.eyes}>
                      <View style={styles.eye} />
                      <View style={styles.eye} />
                    </View>
                    <View style={styles.smile} />
                  </View>
                  
                  {/* Body */}
                  <View style={styles.body}>
                    {/* Green shirt */}
                    <View style={styles.shirt} />
                    
                    {/* Arms */}
                    <View style={styles.arms}>
                      <View style={styles.leftArm} />
                      <View style={styles.rightArm} />
                    </View>
                  </View>
                </View>
                
                {/* Grocery bag */}
                <View style={styles.groceryBag}>
                  <View style={styles.bagBody} />
                  <View style={styles.bagTop} />
                  {/* Vegetables sticking out */}
                  <View style={styles.vegetables}>
                    <View style={styles.carrot} />
                    <View style={styles.leafy} />
                  </View>
                </View>
              </View>
              
              {/* Plant pot */}
              <View style={styles.plantPot}>
                <View style={styles.pot} />
                <View style={styles.plant}>
                  <View style={styles.leaf} />
                  <View style={styles.leaf2} />
                  <View style={styles.leaf3} />
                </View>
              </View>
            </View>
          </View>

          {/* Brand Title */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>Namma Kadai</Text>
            <Text style={styles.tagline}>
              Fresh groceries delivered to your doorstep with love and care
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0',
  },
  gradient: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  illustrationContainer: {
    width: width * 0.85,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  illustrationBackground: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Woman illustration
  womanContainer: {
    position: 'absolute',
    right: '20%',
    top: '15%',
  },
  woman: {
    alignItems: 'center',
  },
  face: {
    position: 'relative',
    marginBottom: 5,
  },
  hair: {
    width: 50,
    height: 35,
    backgroundColor: '#2c2c2c',
    borderRadius: 25,
    marginBottom: -15,
    zIndex: 1,
  },
  faceShape: {
    width: 40,
    height: 45,
    backgroundColor: '#fdbcb4',
    borderRadius: 20,
    zIndex: 2,
  },
  eyes: {
    position: 'absolute',
    top: 25,
    flexDirection: 'row',
    width: 30,
    justifyContent: 'space-between',
    left: 5,
    zIndex: 3,
  },
  eye: {
    width: 3,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  smile: {
    position: 'absolute',
    top: 35,
    left: 15,
    width: 10,
    height: 5,
    borderBottomWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    zIndex: 3,
  },
  body: {
    alignItems: 'center',
  },
  shirt: {
    width: 60,
    height: 80,
    backgroundColor: '#4ade80',
    borderRadius: 15,
  },
  arms: {
    position: 'absolute',
    top: 10,
    width: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftArm: {
    width: 15,
    height: 50,
    backgroundColor: '#fdbcb4',
    borderRadius: 7,
    transform: [{ rotate: '-20deg' }],
  },
  rightArm: {
    width: 15,
    height: 50,
    backgroundColor: '#fdbcb4',
    borderRadius: 7,
    transform: [{ rotate: '20deg' }],
  },

  // Grocery bag
  groceryBag: {
    position: 'absolute',
    right: -25,
    top: 40,
  },
  bagBody: {
    width: 35,
    height: 45,
    backgroundColor: '#d2691e',
    borderRadius: 5,
  },
  bagTop: {
    width: 35,
    height: 8,
    backgroundColor: '#8b4513',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginTop: -3,
  },
  vegetables: {
    position: 'absolute',
    top: -15,
    left: 8,
  },
  carrot: {
    width: 4,
    height: 20,
    backgroundColor: '#ff8c00',
    borderRadius: 2,
  },
  leafy: {
    width: 15,
    height: 8,
    backgroundColor: '#228b22',
    borderRadius: 4,
    marginTop: -5,
    marginLeft: 5,
  },

  // Plant pot
  plantPot: {
    position: 'absolute',
    left: '15%',
    top: '60%',
  },
  pot: {
    width: 40,
    height: 30,
    backgroundColor: '#8b4513',
    borderRadius: 5,
  },
  plant: {
    position: 'absolute',
    top: -10,
    left: 15,
  },
  leaf: {
    width: 8,
    height: 15,
    backgroundColor: '#228b22',
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
  },
  leaf2: {
    width: 6,
    height: 12,
    backgroundColor: '#32cd32',
    borderRadius: 6,
    position: 'absolute',
    top: 2,
    left: 5,
    transform: [{ rotate: '10deg' }],
  },
  leaf3: {
    width: 7,
    height: 14,
    backgroundColor: '#228b22',
    borderRadius: 7,
    position: 'absolute',
    top: 1,
    left: -3,
    transform: [{ rotate: '45deg' }],
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#4ade80',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  ctaSection: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  getStartedButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4ade80',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
