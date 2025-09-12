import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { currentTheme } from "@/constants/Colors";
import { LocationModal } from "@/components/LocationModal";
import { getCurrentLocationWithAddress } from "@/services/locationService";
import { setCurrentLocation, setWelcomeCompleted } from "@/store/slices/authSlice";
import { showSnackbar } from "@/store/slices/snackbarSlice";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const dispatch = useDispatch();
  const { currentLocation, hasCompletedWelcome } = useSelector((state: RootState) => state.auth);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const handleExploreClick = () => {
    // Mark welcome as completed
    dispatch(setWelcomeCompleted(true));
    
    // Check if location is available
    if (!currentLocation) {
      setShowLocationModal(true);
    } else {
      // Navigate to home if location is already available
      router.push("/(tabs)/home");
    }
  };

  const handleLocationRequest = async () => {
    setIsLocationLoading(true);
    try {
      const location = await getCurrentLocationWithAddress({
        timeout: 15000,
        enableHighAccuracy: true,
        showSnackbar: (message, type) => dispatch(showSnackbar({ message, type }))
      });

      if (location) {
        dispatch(setCurrentLocation(location));
        setShowLocationModal(false);
        // Navigate to home after getting location
        router.push("/(tabs)/home");
      } else {
        dispatch(showSnackbar({ 
          message: 'Unable to get location. Please try again or enable location services.', 
          type: 'error' 
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      dispatch(showSnackbar({ 
        message: 'Failed to get location. Please try again.', 
        type: 'error' 
      }));
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleLocationSkip = () => {
    setShowLocationModal(false);
    // Navigate to home even without location (app can handle this)
    router.push("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={currentTheme.background}
        barStyle="dark-content"
      />

      <Image
        source={require("@/assets/auth-bg.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {"Discover local stores and products near you.\nSign in for a personalized experience."}
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.exploreButton}
            onPress={handleExploreClick}
          >
            <Text style={styles.exploreText}>Explore Dashboard</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={currentTheme.primary}
            />
          </Pressable>
        </View>
      </View>

      {/* Location Modal */}
      <LocationModal
        visible={showLocationModal}
        onRequestLocation={handleLocationRequest}
        onSkip={handleLocationSkip}
        loading={isLocationLoading}
        required={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImage: {
    width: "100%",
    height: height * 0.8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: currentTheme.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: currentTheme.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  signInButton: {
    paddingVertical: 12,
  },
  signInText: {
    fontSize: 18,
    fontWeight: "500",
    color: currentTheme.textSecondary,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  exploreText: {
    fontSize: 18,
    fontWeight: "600",
    color: currentTheme.primary,
  },
});
