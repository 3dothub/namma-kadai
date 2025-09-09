import React from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Ionicons } from "@expo/vector-icons";
import { currentTheme } from "../constants/Colors";

const { height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={currentTheme.background}
        barStyle="dark-content"
      />

      <Image
        source={require("../assets/auth-bg.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {isAuthenticated
            ? "Discover amazing products and services in your area"
            : "Discover local stores and products near you.\nSign in for a personalized experience."}
        </Text>

        <View style={styles.actions}>
          {!isAuthenticated && (
            <Pressable
              style={styles.signInButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.exploreButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.exploreText}>Explore Dashboard
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={currentTheme.primary}
            />
          </Pressable>
        </View>
      </View>
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
