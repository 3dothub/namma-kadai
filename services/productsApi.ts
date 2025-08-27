import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api-config';

// Define types for your API responses
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery,
  endpoints: (builder) => ({
    // Get all products
    getProducts: builder.query<Product[], void>({
      query: () => 'products',
    }),
    
    // Get a single product by ID
    getProduct: builder.query<Product, number>({
      query: (id) => `products/${id}`,
    }),
    
    // Add a new product
    addProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: (product) => ({
        url: 'products',
        method: 'POST',
        body: product,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
} = productsApi;
