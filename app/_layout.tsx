import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SnackBar } from "../components/SnackBar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { hideSnackbar } from "../store/slices/snackbarSlice";
import { ReduxProvider } from "../providers";

function AppContent() {
  const dispatch = useDispatch();
  const snackbarState = useSelector((state: RootState) => state.snackbar);

  const handleHideSnackbar = () => {
    dispatch(hideSnackbar());
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Slot />
      <SnackBar
        visible={snackbarState.visible}
        message={snackbarState.message}
        type={snackbarState.type}
        onHide={handleHideSnackbar}
      />
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
