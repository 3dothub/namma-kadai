import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useLoginMutation } from "../../src/store/api/authApi";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../src/store/slices/snackbarSlice";
import { Ionicons } from "@expo/vector-icons";
import { currentTheme } from "../../src/constants/Colors";
import { sharedStyles } from "../../src/constants/SharedStyles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      dispatch(
        showSnackbar({ message: "Please fill in all fields", type: "error" })
      );
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      const successMessage = response.message || "Login successful!";
      dispatch(showSnackbar({ message: successMessage, type: "success" }));

      // Enhanced location check after login
      setTimeout(() => {
        const hasLocationData = response.user.addresses?.some(
          (address) =>
            address.location && address.location.lat && address.location.lng
        );

        console.log('Login redirect logic:', {
          hasLocationData,
          addressCount: response.user.addresses?.length || 0,
          userCreatedAt: response.user.createdAt,
        });

        // Check if this is a relatively new account (created in last 24 hours)
        const isNewAccount = response.user.createdAt && 
          (new Date().getTime() - new Date(response.user.createdAt).getTime()) < (24 * 60 * 60 * 1000);

        if (hasLocationData) {
          // User has valid location data, go to home
          router.replace("/(tabs)/home");
        } else if (isNewAccount) {
          // New account without location, prioritize location setup
          router.replace("/welcome");
        } else {
          // Existing account without location, still go to welcome for location setup
          router.replace("/welcome");
        }
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Login failed";
      console.log(error);

      dispatch(showSnackbar({ message: errorMessage, type: "error" }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
      <SafeAreaView style={sharedStyles.content} edges={["top", "bottom"]}>
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={sharedStyles.header}>
            <Text style={styles.title}>Sign in</Text>
          </View>
            <View style={sharedStyles.form}>
              <View style={sharedStyles.inputGroup}>
                <Text style={sharedStyles.label}>Email</Text>
                <View
                  style={[
                    sharedStyles.inputContainer,
                    emailFocused && sharedStyles.inputContainerActive,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={currentTheme.textTertiary}
                    style={sharedStyles.inputIcon}
                  />
                  <TextInput
                    style={sharedStyles.input}
                    placeholder="demo@email.com"
                    placeholderTextColor={currentTheme.inputPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={false}
                    scrollEnabled={false}
                    textAlignVertical="center"
                  />
                </View>
              </View>

              <View style={sharedStyles.inputGroup}>
                <Text style={sharedStyles.label}>Password</Text>
                <View
                  style={[
                    sharedStyles.inputContainer,
                    passwordFocused && sharedStyles.inputContainerActive,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={currentTheme.textTertiary}
                    style={sharedStyles.inputIcon}
                  />
                  <TextInput
                    style={sharedStyles.input}
                    placeholder="enter your password"
                    placeholderTextColor={currentTheme.inputPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    multiline={false}
                    scrollEnabled={false}
                    textAlignVertical="center"
                  />
                  <TouchableOpacity
                    style={sharedStyles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={18}
                      color={currentTheme.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me and Forgot Password */}
              <View style={sharedStyles.optionsRow}>
                <TouchableOpacity
                  style={sharedStyles.optionContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      sharedStyles.checkbox,
                      rememberMe && sharedStyles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={currentTheme.textOnPrimary}
                      />
                    )}
                  </View>
                  <Text style={sharedStyles.optionText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={sharedStyles.linkButton}>Forget Password?</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  sharedStyles.primaryButton,
                  isLoading && sharedStyles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={sharedStyles.buttonText}>
                  {isLoading ? "Signing In..." : "Login"}
                </Text>
              </TouchableOpacity>
              <View style={styles.socialButtonsContainer}>
                <View style={styles.socialButtonLeftContainer}>
                  <TouchableOpacity style={styles.socialButtonLeft}>
                    <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.greyText}>{"   or continue with   "}</Text>
                <View style={styles.socialButtonRightContainer}>
                  <TouchableOpacity style={styles.socialButtonRight}>
                    <Ionicons name="logo-google" size={24} color="#ea4335" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          {/* Footer */}
          <View style={sharedStyles.footer}>
            <View style={styles.footerContent}>
              <Text style={sharedStyles.footerText}>
                Don't have an Account?{" "}
                <Link href="/(auth)/register">
                  <Text style={sharedStyles.linkText}>Sign up</Text>
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Full white background
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%", // Increased to better show wavy curve
    width: "100%",
    zIndex: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    zIndex: 1, // Ensure content is above background
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: currentTheme.textPrimary,
    marginBottom: 32,
    textAlign: "left", // Left align
  },
  footerContent: {
    width: "100%",
  },
  greyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingVertical: 24,
  },
  socialButtonLeftContainer: {
    alignItems: "flex-start",
  },
  socialButtonRightContainer: {
    alignItems: "flex-end",
  },
  socialButtonLeft: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  socialButtonRight: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
});
