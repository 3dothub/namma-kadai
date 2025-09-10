import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppWrapper } from "../components/AppWrapper";
import { ReduxProvider } from "../src/providers";

function AppContent() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppWrapper>
        <Slot />
      </AppWrapper>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <AppContent />
    </ReduxProvider>
  );
}
