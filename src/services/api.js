import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import logoutHandler from '../utils/controllers/logoutHandler';
import { API_URL } from '../config/Config';

// Create a base query with common settings
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: headers => {
    // Include the access token in headers if available
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// Create a base query with token refresh handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.data?.errorObject?.errorCode === 401) {
    const oldRefreshToken = localStorage.getItem('refreshToken');
    if (oldRefreshToken) {
      const response = await baseQuery(
        `/User/renewToken?refreshToken=${oldRefreshToken}`,
        api,
        extraOptions
      );

      if (response?.data?.success) {
        const { accessToken, refreshToken } = response?.data?.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Handle token refresh failure by removing tokens and redirecting to login
        logoutHandler();
      }
    }
  }

  return result;
};

// Create the API using Redux Toolkit's createApi
export const bridgedApi = createApi({
  reducerPath: 'bridgedApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['userInfo'],
  endpoints: builder => ({
    // User login mutation
    login: builder.mutation({
      query: data => ({
        url: '/User/Login',
        method: 'POST',
        body: data,
      }),
    }),
    userInfo: builder.query({
      query: () => '/User/Profile',
      providesTags: ['userInfo'],
    }),
  }),
});

// Export hooks for each endpoint
export const { useLoginMutation, useUserInfoQuery } = bridgedApi;
