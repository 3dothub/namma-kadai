import React from "react";
import { View, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { Snackbar } from "./Snackbar";
import { hideSnackbar } from "../store/slices/snackbarSlice";

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const dispatch = useDispatch();

  const { visible, message, type } = useSelector((state: RootState) => state.snackbar);

  const handleSnackbarHide = () => {
    dispatch(hideSnackbar());
  };

  return (
    <View style={styles.container}>
      {children}
      <Snackbar visible={visible} message={message} type={type} onHide={handleSnackbarHide} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
