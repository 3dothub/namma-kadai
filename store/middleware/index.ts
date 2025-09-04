import { Middleware } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
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

  // Handle local actions
  if (logout.match(action)) {
    store.dispatch(showSnackbar({ message: 'Logged out successfully', type: 'success' }));
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
