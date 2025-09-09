import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";
import { userUrl } from "../../config/apiBaseUrl";

interface UpdateLocationRequest {
  lat: number;
  lng: number;
}

interface LocationResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: userUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    updateLocation: builder.mutation<LocationResponse, UpdateLocationRequest>({
      query: (locationData) => ({
        url: "/update-location",
        method: "POST",
        body: locationData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUpdateLocationMutation } = userApi;
