import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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

// Create the API using Redux Toolkit's createApi
export const bridgedApi = createApi({
  reducerPath: 'bridgedApi',
  baseQuery,
  tagTypes: ['userInfo', 'users'],
  endpoints: builder => ({
    // User login mutation
    login: builder.mutation({
      query: data => ({
        url: '/AdminUser/Login',
        method: 'POST',
        body: data,
      }),
    }),
    userInfo: builder.query({
      query: () => '/User/Profile',
      providesTags: ['userInfo'],
    }),
    findAllUsers: builder.query({
      query: () => '/User/Admin/FindAllUsers',
      providesTags: ['users'],
    }),
    addUser: builder.mutation({
      query: data => ({
        url: '/User/Admin/CreateByAdmin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['users'],
    }),
  }),
});

// Export hooks for each endpoint
export const { useLoginMutation, useUserInfoQuery, useFindAllUsersQuery, useAddUserMutation } =
  bridgedApi;
