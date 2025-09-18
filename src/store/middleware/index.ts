import { Middleware } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import { vendorApi } from "../api/vendorApi";
import { favoritesApi } from "../api/favoritesApi";
import { orderApi } from "../api/orderApi";
import { notificationApi } from "../api/notificationApi";
import { showSnackbar } from "../slices/snackbarSlice";
import { logout } from "../slices/userSlice";
import { clearAllProductData } from "../slices/productSlice";

interface ErrorResponse {
  data?: {
    message?: string;
  };
  status?: number;
}

export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (logout.match(action)) {
    store.dispatch(authApi.util.resetApiState());
    store.dispatch(userApi.util.resetApiState());
    store.dispatch(vendorApi.util.resetApiState());
    store.dispatch(favoritesApi.util.resetApiState());
    store.dispatch(orderApi.util.resetApiState());
    store.dispatch(notificationApi.util.resetApiState());
    store.dispatch(clearAllProductData());
    store.dispatch(showSnackbar({ message: "Logged out successfully", type: "success" }));
  }

  // Handle API responses
  if (authApi.endpoints.login.matchFulfilled(action)) {
    store.dispatch(showSnackbar({ message: "Login successful", type: "success" }));
  }
  if (isRejectedWithValue(action) && action.type.startsWith("authApi/executeQuery/login")) {
    const error = action.payload as ErrorResponse;
    const errorMessage = error?.data?.message || "Login failed";
    store.dispatch(
      showSnackbar({
        message: errorMessage,
        type: "error",
      })
    );
  }
  if (authApi.endpoints.register.matchFulfilled(action)) {
    store.dispatch(showSnackbar({ message: "Registration successful", type: "success" }));
  }
  if (isRejectedWithValue(action) && action.type.startsWith("authApi/executeQuery/register")) {
    const error = action.payload as ErrorResponse;
    const errorMessage = error?.data?.message || "Registration failed";
    store.dispatch(
      showSnackbar({
        message: errorMessage,
        type: "error",
      })
    );
  }

  return result;
};
