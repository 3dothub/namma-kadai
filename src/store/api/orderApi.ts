import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ordersUrl } from '../../config/apiBaseUrl';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface ScheduleDetails {
  isScheduled: boolean;
  scheduledFor?: Date;
  scheduleType: 'immediate' | 'scheduled';
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  specialInstructions?: string;
}

export interface Order {
  _id: string;
  userId: string;
  vendorId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderType: 'delivery' | 'takeaway';
  deliveryAddress?: DeliveryAddress;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  scheduleDetails: ScheduleDetails;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  vendorId: string;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  orderType: 'delivery' | 'takeaway';
  scheduleDetails?: ScheduleDetails;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  message: string;
}

export interface GetOrdersResponse {
  success: boolean;
  orders: Order[];
  message: string;
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ordersUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),
    getUserOrders: builder.query<GetOrdersResponse, string>({
      query: (userId) => `/user/${userId}`,
      providesTags: ['Order'],
    }),
    getMyOrders: builder.query<GetOrdersResponse, void>({
      query: () => '/my-orders',
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<
      { success: boolean; order: Order; message: string },
      { orderId: string; status: Order['status'] }
    >({
      query: ({ orderId, status }) => ({
        url: `/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    cancelOrder: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (orderId) => ({
        url: `/${orderId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetMyOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = orderApi;
