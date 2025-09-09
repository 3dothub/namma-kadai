import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

export interface UserAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  addresses: UserAddress[];
  cart: CartItem[];
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasLocationAccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasLocationAccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLocationAccess: (state, action: PayloadAction<boolean>) => {
      state.hasLocationAccess = action.payload;
    },
    addUserAddress: (state, action: PayloadAction<UserAddress>) => {
      if (state.user) {
        state.user.addresses.push(action.payload);
      }
    },
    updateUserAddress: (state, action: PayloadAction<{ index: number; address: UserAddress }>) => {
      if (state.user && state.user.addresses[action.payload.index]) {
        state.user.addresses[action.payload.index] = action.payload.address;
      }
    },
    removeUserAddress: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.addresses.splice(action.payload, 1);
      }
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (state.user) {
        const existingItem = state.user.cart.find(item => item.productId === action.payload.productId);
        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
        } else {
          state.user.cart.push(action.payload);
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.cart = state.user.cart.filter(item => item.productId !== action.payload);
      }
    },
    updateCartQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      if (state.user) {
        const item = state.user.cart.find(item => item.productId === action.payload.productId);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      if (state.user) {
        const index = state.user.favorites.indexOf(action.payload);
        if (index === -1) {
          state.user.favorites.push(action.payload);
        } else {
          state.user.favorites.splice(index, 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Handle login mutation
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      }
    );
    builder.addMatcher(
      authApi.endpoints.login.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      authApi.endpoints.login.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Login failed';
      }
    );

    // Handle register mutation
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      }
    );
    builder.addMatcher(
      authApi.endpoints.register.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      authApi.endpoints.register.matchRejected,
      (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || 'Registration failed';
      }
    );

    // Handle verify token query
    builder.addMatcher(
      authApi.endpoints.verifyToken.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      }
    );
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  updateUserData,
  setLocationAccess,
  addUserAddress,
  updateUserAddress,
  removeUserAddress,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  toggleFavorite
} = authSlice.actions;
export default authSlice.reducer;
