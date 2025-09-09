import { Middleware } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { vendorApi } from '../api/vendorApi';
import { favoritesApi } from '../api/favoritesApi';
import { orderApi } from '../api/orderApi';
import { notificationApi } from '../api/notificationApi';
import { showSnackbar } from '../slices/snackbarSlice';
import { logout } from '../slices/authSlice';

interface ErrorResponse {
  data?: {
    message?: string;
  };
  status?: number;
}

// Auth middleware to handle auth-related notifications
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Temporarily disable auto-logout on 401/403 to prevent session expired loops
  // if (isRejectedWithValue(action)) {
  //   const error = action.payload as ErrorResponse;
  //   if (error?.status === 401 || error?.status === 403) {
  //     // Only auto-logout for critical API endpoints, not all 401/403 errors
  //     const actionType = action.type;
  //     const shouldAutoLogout = actionType.includes('authApi/executeQuery/verify') || 
  //                             actionType.includes('userApi/') ||
  //                             actionType.includes('orderApi/');
      
  //     if (shouldAutoLogout) {
  //       console.log('Critical API unauthorized access detected, logging out user');
  //       store.dispatch(logout());
  //       store.dispatch(showSnackbar({ 
  //         message: 'Session expired. Please login again.', 
  //         type: 'error' 
  //       }));
  //     }
  //   }
  // }
  
  // Handle logout - clear all API caches to prevent data leakage
  if (logout.match(action)) {
    store.dispatch(authApi.util.resetApiState());
    store.dispatch(userApi.util.resetApiState());
    store.dispatch(vendorApi.util.resetApiState());
    store.dispatch(favoritesApi.util.resetApiState());
    store.dispatch(orderApi.util.resetApiState());
    store.dispatch(notificationApi.util.resetApiState());
    store.dispatch(showSnackbar({ message: 'Logged out successfully', type: 'success' }));
  }
  
  // Handle API responses
  if (authApi.endpoints.login.matchFulfilled(action)) {
    store.dispatch(showSnackbar({ message: 'Login successful', type: 'success' }));
  }
  if (isRejectedWithValue(action) && action.type.startsWith('authApi/executeQuery/login')) {
    const error = action.payload as ErrorResponse;
    const errorMessage = error?.data?.message || 'Login failed';
    store.dispatch(showSnackbar({ 
      message: errorMessage, 
      type: 'error' 
    }));
  }
  if (authApi.endpoints.register.matchFulfilled(action)) {
    store.dispatch(showSnackbar({ message: 'Registration successful', type: 'success' }));
  }
  if (isRejectedWithValue(action) && action.type.startsWith('authApi/executeQuery/register')) {
    const error = action.payload as ErrorResponse;
    const errorMessage = error?.data?.message || 'Registration failed';
    store.dispatch(showSnackbar({ 
      message: errorMessage, 
      type: 'error' 
    }));
  }

  return result;
};

// Add other middlewares here
// Example:
// export const productMiddleware: Middleware = (store) => (next) => (action) => {
//   const result = next(action);
//   // Handle product-related notifications
//   return result;
// };
