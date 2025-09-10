import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { favoritesUrl } from '../../config/apiBaseUrl';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

interface FavoritesResponse {
  message: string;
  favorites: Product[];
}

interface AddRemoveFavoriteResponse {
  message: string;
  product: Product;
}

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: favoritesUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Favorites'],
  endpoints: (builder) => ({
    getFavorites: builder.query<FavoritesResponse, void>({
      query: () => '/',
      providesTags: ['Favorites'],
    }),
    addToFavorites: builder.mutation<AddRemoveFavoriteResponse, string>({
      query: (productId) => ({
        url: `/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorites'],
    }),
    removeFromFavorites: builder.mutation<AddRemoveFavoriteResponse, string>({
      query: (productId) => ({
        url: `/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = favoritesApi;
