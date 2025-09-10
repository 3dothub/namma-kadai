import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vendor, Product } from '../api/vendorApi';

export interface CartItem extends Product {
  quantity: number;
}

interface ProductState {
  vendors: Vendor[];
  products: Product[];
  favorites: Product[];
  cart: CartItem[];
  userLocation: {
    lat: number;
    lng: number;
  } | null;
  nearbyVendors: Vendor[];
  isLoadingVendors: boolean;
  isLoadingProducts: boolean;
}

const initialState: ProductState = {
  vendors: [],
  products: [],
  favorites: [],
  cart: [],
  userLocation: null,
  nearbyVendors: [],
  isLoadingVendors: false,
  isLoadingProducts: false,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.vendors = action.payload;
      state.products = action.payload.flatMap(vendor => vendor.products || []);
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.userLocation = action.payload;
    },
    clearUserLocation: (state) => {
      state.userLocation = null;
    },
    setNearbyVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.nearbyVendors = action.payload;
    },
    setLoadingVendors: (state, action: PayloadAction<boolean>) => {
      state.isLoadingVendors = action.payload;
    },
    setLoadingProducts: (state, action: PayloadAction<boolean>) => {
      state.isLoadingProducts = action.payload;
    },
    addProductToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(item => item._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ ...product, quantity });
      }
    },
    removeProductFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item._id !== action.payload);
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.cart.find(item => item._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.cart = state.cart.filter(item => item._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const product = state.products.find(p => p._id === productId);
      
      if (product) {
        const isFavorite = state.favorites.some(fav => fav._id === productId);
        
        if (isFavorite) {
          state.favorites = state.favorites.filter(fav => fav._id !== productId);
        } else {
          state.favorites.push(product);
        }
      }
    },
    setFavorites: (state, action: PayloadAction<Product[]>) => {
      state.favorites = action.payload;
    },
    loadLocationBasedData: (state, action: PayloadAction<{ vendors: Vendor[]; location: { lat: number; lng: number } }>) => {
      const { vendors, location } = action.payload;
      state.vendors = vendors;
      state.nearbyVendors = vendors;
      state.products = vendors.flatMap(vendor => vendor.products || []);
      state.userLocation = location;
    },
    clearAllProductData: (state) => {
      // Reset all product state to initial values
      Object.assign(state, initialState);
    },
  },
});

export const {
  setVendors,
  setProducts,
  setUserLocation,
  clearUserLocation,
  setNearbyVendors,
  setLoadingVendors,
  setLoadingProducts,
  addProductToCart,
  removeProductFromCart,
  updateCartItemQuantity,
  clearCart,
  toggleFavorite,
  setFavorites,
  loadLocationBasedData,
  clearAllProductData,
} = productSlice.actions;

export default productSlice.reducer;
