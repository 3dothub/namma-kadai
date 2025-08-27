import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { JWT_SECRET_KEY, API_URL } from "@env";

console.log('API Config - Using API URL:', API_URL);

const baseQueryWithLogging = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    console.log('Preparing headers for request');
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
      console.log('Token set in headers');
    }

    headers.set("content-type", "application/json");
    console.log('Headers prepared:', Object.fromEntries(headers.entries()));
    return headers;
  },
});

export const baseQuery = async (args: any, api: any, extraOptions: any) => {
  console.log('Making request to:', API_URL + (typeof args === 'string' ? args : args.url));
  console.log('Request args:', args);
  try {
    const result = await baseQueryWithLogging(args, api, extraOptions);
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    return { error };
  }
};
