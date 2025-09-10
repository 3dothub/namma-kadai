import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { baseUrl } from '../../config/apiBaseUrl';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'delivery';
  isRead: boolean;
  data?: {
    orderId?: string;
    action?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  total: number;
  message: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/notifications`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query<GetNotificationsResponse, { page?: number; limit?: number; isRead?: boolean }>({
      query: ({ page = 1, limit = 20, isRead } = {}) => ({
        url: '',
        method: 'GET',
        params: {
          page,
          limit,
          ...(isRead !== undefined && { isRead }),
        },
      }),
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation<MarkAsReadResponse, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<MarkAsReadResponse, void>({
      query: () => ({
        url: '/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<DeleteNotificationResponse, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteAllNotifications: builder.mutation<DeleteNotificationResponse, void>({
      query: () => ({
        url: '/delete-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = notificationApi;
