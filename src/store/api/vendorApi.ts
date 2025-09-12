import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { vendorUrl } from '../../config/apiBaseUrl';

export interface Vendor {
  _id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: string;
      coordinates: [number, number]; // [lng, lat]
    };
  };
  shopDetails: {
    logoUrl: string;
    description: string;
    openingHours: {
      monday: { open: string; close: string; isOpen: boolean };
      tuesday: { open: string; close: string; isOpen: boolean };
      wednesday: { open: string; close: string; isOpen: boolean };
      thursday: { open: string; close: string; isOpen: boolean };
      friday: { open: string; close: string; isOpen: boolean };
      saturday: { open: string; close: string; isOpen: boolean };
      sunday: { open: string; close: string; isOpen: boolean };
    };
    categories: string[];
    surroundingAreas: string[];
    minOrderValue: number;
  };
  isActive: boolean;
  serviceTypes: {
    delivery: boolean;
    takeaway: boolean;
  };
  deliverySettings: {
    radius: number;
    areas: string[];
    minDeliveryAmount: number;
    freeDeliveryAbove: number;
    deliveryCharge: number;
  };
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface Product {
  _id: string;
  vendorId: { $oid: string } | string; // Support both ObjectId format and string
  name: string;
  description: string;
  price: number;
  offerPrice?: number; // Keep this for compatibility
  stock: number;
  unit: string;
  images: string[];
  isActive: boolean;
  createdAt: { $date: string } | string; // Support both MongoDB date format and string
  updatedAt: { $date: string } | string; // Support both MongoDB date format and string
  // Computed fields for frontend
  deliveryTime?: string; // Can be computed based on vendor settings
  category?: string; // Can be derived from vendor categories
  isAvailable?: boolean; // Computed from stock > 0 && isActive
}

// Helper functions for vendor data
export const getVendorLocation = (vendor: Vendor) => {
  const [lng, lat] = vendor.address.location.coordinates;
  return { lat, lng };
};

export const getVendorMainCategory = (vendor: Vendor) => {
  return vendor.shopDetails.categories[0] || 'General';
};

export const isVendorOpen = (vendor: Vendor) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof vendor.shopDetails.openingHours;
  const todayHours = vendor.shopDetails.openingHours[today];
  
  if (!todayHours.isOpen) return false;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

export const getVendorImage = (vendor: Vendor) => {
  return vendor.shopDetails.logoUrl || '@/assets/icon.png';
};

// Product helper functions
export const getProductMainImage = (product: Product) => {
  return product.images && product.images.length > 0 ? product.images[0] : '@/assets/icon.png';
};

export const isProductAvailable = (product: Product) => {
  return product.isActive && product.stock > 0;
};

export const getProductDeliveryTime = (product: Product, vendor?: Vendor) => {
  // You can compute this based on vendor location, product type, etc.
  // For now, return a default value
  return '30-45 mins';
};

export const formatProductUnit = (product: Product) => {
  return `per ${product.unit}`;
};

// Helper to extract vendorId from different formats
export const getProductVendorId = (product: Product): string => {
  if (typeof product.vendorId === 'string') {
    return product.vendorId;
  }
  return product.vendorId.$oid;
};

// Helper to extract date from different formats
export const getProductDate = (dateField: { $date: string } | string): Date => {
  if (typeof dateField === 'string') {
    return new Date(dateField);
  }
  return new Date(dateField.$date);
};

interface GetVendorsRequest {
  lat: number;
  lng: number;
  radius?: number;
  city?: string;
  isActive?: boolean;
}

interface GetVendorProductsRequest {
  vendorId: string;
}

interface VendorsResponse {
  vendors: Vendor[];
  total: number;
  message: string;
}

interface VendorProductsResponse {
  products: Product[];
  vendor: Vendor;
  total: number;
  message: string;
}

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: vendorUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vendor', 'VendorProducts'],
  endpoints: (builder) => ({
    getVendors: builder.query<VendorsResponse, GetVendorsRequest>({
      query: ({ lat, lng, radius = 5, city, isActive = true }) => ({
        url: '',
        method: 'GET',
        params: {
          lat,
          lng,
          radius,
          ...(city && { city }),
          isActive,
        },
      }),
      providesTags: ['Vendor'],
    }),
    getVendorProducts: builder.query<VendorProductsResponse, GetVendorProductsRequest>({
      query: ({ vendorId }) => ({
        url: '/products',
        method: 'GET',
        params: {
          vendorId,
        },
      }),
      providesTags: ['VendorProducts'],
    }),
  }),
});

export const { 
  useGetVendorsQuery, 
  useGetVendorProductsQuery,
  useLazyGetVendorsQuery,
  useLazyGetVendorProductsQuery 
} = vendorApi;
