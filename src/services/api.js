import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config/Config';

// Create a base query with common settings
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState, endpoint, extra, requestId }) => {
    // Check if this endpoint needs custom token handling
    const customTokenEndpoints = ['getAllUserDomains', 'getCustomerReport'];

    if (customTokenEndpoints.includes(endpoint)) {
      // For these endpoints, don't set default token - let the endpoint handle it
      return headers;
    }

    // Use default access token from localStorage for other endpoints
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// Enhanced base query with 401 handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 response, redirect to login
  if (result.error && result.error.status === 401) {
    // Clear any stored tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect to login page
    window.location.href = '/login';
  }

  return result;
};

// Create the API using Redux Toolkit's createApi
export const bridgedApi = createApi({
  reducerPath: 'bridgedApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'userInfo',
    'users',
    'defaultChecklists',
    'userChecklists',
    'taskComments',
    'userConfiguration',
    'companies',
  ],
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

    findAllUsersPagination: builder.mutation({
      query: ({ companyId, status, sort, search, page, limit }) => ({
        url: `/User/Admin/FindAllUsers?companyId=${companyId}&status=${status}&sort=${sort}&search=${search}&page=${page}&limit=${limit}`,
        method: 'POST',
        body: { companyId, status, sort, search, page, limit },
      }),
      invalidatesTags: ['users'],
    }),

    getUserAdminPagination: builder.mutation({
      query: ({ companyId, status, sort, search, pageNumber, limit }) => ({
        url: '/User/Admin/Pagination',
        method: 'POST',
        body: {
          ...(companyId && { companyId }),
          status: status || 'all',
          sort: sort || 'lastLogin_DESC',
          search: search || '',
          pageNumber: pageNumber || 1,
          limit: limit || 10,
        },
      }),
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

    getUserForUpdateByAdmin: builder.query({
      query: userId => ({
        url: `/User/Admin/GetUserForUpdate?userId=${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'users', id: userId }],
    }),

    updateUserByAdmin: builder.mutation({
      query: data => ({
        url: '/User/Admin/UpdateByAdmin',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['users'],
    }),

    generateUserToken: builder.mutation({
      query: data => ({
        url: '/User/Admin/GenerateTokenForUserByAdmin',
        method: 'POST',
        body: data,
      }),
    }),

    getAllUserDomains: builder.mutation({
      query: ({ customToken }) => ({
        url: '/Domain/FindAll',
        method: 'GET',
        headers: customToken
          ? {
              Authorization: `Bearer ${customToken}`,
            }
          : {},
      }),
    }),

    getCustomerReport: builder.mutation({
      query: ({ data, customToken }) => ({
        url: '/Campaign/dataExport',
        method: 'POST',
        body: data,
        headers: customToken
          ? {
              Authorization: `Bearer ${customToken}`,
            }
          : {},
      }),
    }),

    getResearchPartnerDate: builder.mutation({
      query: data => ({
        url: 'https://ai-agents-api.bridged.media/api/rp_agent/data_export',
        method: 'POST',
        body: data,
      }),
    }),

    getDiscoveryAgentData: builder.mutation({
      query: data => ({
        url: 'https://ai-agents-api.bridged.media/api/discovery_agent/data_export',
        method: 'POST',
        body: data,
      }),
    }),

    getSummaryUsageData: builder.mutation({
      query: data => ({
        url: 'https://summary-agent.bridged.media/exportSummaryUsageData',
        method: 'POST',
        body: data,
      }),
    }),

    getSEOV3Data: builder.mutation({
      query: data => ({
        url: 'https://seo-agent.bridged.media/exportSEOV3UsageData',
        method: 'POST',
        body: data,
      }),
    }),

    getSEOV4Data: builder.mutation({
      query: data => ({
        url: 'https://seo-agent.bridged.media/exportSEOV4UsageData',
        method: 'POST',
        body: data,
      }),
    }),

    getBacklinkUsageData: builder.mutation({
      query: data => ({
        url: 'https://backlink-agent.bridged.media/exportBacklinkUsageData',
        method: 'POST',
        body: data,
      }),
    }),

    getDefaultChecklist: builder.query({
      query: () => ({
        url: '/checklists/Admin/DefaultChecklists',
        method: 'GET',
      }),
      providesTags: ['defaultChecklists'],
    }),

    addDefaultChecklist: builder.mutation({
      query: data => ({
        url: '/checklists/Admin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['defaultChecklists', 'userChecklists'],
    }),

    deleteDefaultChecklist: builder.mutation({
      query: id => ({
        url: `/checklists/Admin/?_id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['defaultChecklists'],
    }),

    deleteUserChecklist: builder.mutation({
      query: id => ({
        url: `/checklists/Admin?_id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['userChecklists'],
    }),

    updateDefaultChecklist: builder.mutation({
      query: ({ id, data }) => ({
        url: `/checklists/Admin/?_id=${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['defaultChecklists'],
    }),

    updateUserChecklist: builder.mutation({
      query: ({ id, data }) => ({
        url: `/checklists/Admin?_id=${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['userChecklists'],
    }),

    uploadImage: builder.mutation({
      query: data => ({
        url: '/Media/Admin/Upload?type=image',
        method: 'POST',
        body: data,
      }),
    }),

    createTask: builder.mutation({
      query: data => ({
        url: `/tasks/Admin`,
        method: 'POST',
        body: data,
        invalidatesTags: ['defaultChecklists'],
      }),
    }),

    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/Admin/?_id=${id}`,
        method: 'PUT',
        body: data,
      }),
    }),

    deleteTask: builder.mutation({
      query: id => ({
        url: `/tasks/Admin/?_id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['defaultChecklists'],
    }),

    getUserChecklist: builder.query({
      query: id => ({
        url: `/checklists/Admin/UsersChecklists/?userId=${id}`,
        method: 'GET',
      }),
      providesTags: ['userChecklists'],
    }),

    getTeamMembers: builder.query({
      query: id => ({
        url: `/Team/Admin/GetTeamMembers?userId=${id}`,
        method: 'GET',
      }),
      providesTags: ['teamMembers'],
    }),

    getUserChecklistTaskComments: builder.query({
      query: taskId => ({
        url: `/TaskComments/Admin/FindAllByTaskId/?_id=${taskId}`,
        method: 'GET',
      }),
      providesTags: (result, error, taskId) => [{ type: 'taskComments', id: taskId }],
    }),

    addTaskComment: builder.mutation({
      query: data => ({
        url: `/TaskComments/Admin/Create`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'taskComments', id: taskId }],
    }),

    // * Companies related
    getCompanies: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/companies/pagination`,
        method: 'POST',
        body: {
          page,
          limit,
          ...(search && { search }),
        },
      }),
      providesTags: ['companies'],
    }),

    createCompany: builder.mutation({
      query: name => ({
        url: `/companies`,
        method: 'POST',
        body: { name: name },
      }),
      invalidatesTags: ['companies'],
    }),

    updateCompany: builder.mutation({
      query: ({ id, name }) => ({
        url: `/companies/?companyId=${id}`,
        method: 'PUT',
        body: { name: name },
      }),
      invalidatesTags: ['companies'],
    }),

    deleteCompany: builder.mutation({
      query: id => ({
        url: `/companies/?companyId=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['companies'],
    }),

    setCompanyUsers: builder.mutation({
      query: ({ id, userIds }) => ({
        url: `/companies/bulkUpdateUsers/?companyId=${id}`,
        method: 'PUT',
        body: { userIds: userIds },
      }),
      invalidatesTags: ['companies', 'users'],
    }),

    // User Configuration (Agents Lock/Unlock)
    getUserConfiguration: builder.query({
      query: userId => ({
        url: `/UserConfiguration/Admin?userId=${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'userConfiguration', id: userId }],
    }),

    updateUserConfiguration: builder.mutation({
      query: data => ({
        url: `/UserConfiguration/Admin`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'userConfiguration', id: userId }],
    }),

    activateUser: builder.mutation({
      query: id => ({
        url: `user/admin/activate?userId=${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['users'],
    }),

    deactivateUser: builder.mutation({
      query: id => ({
        url: `user/admin/deactivate?userId=${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['users'],
    }),
  }),
});

// Export hooks for each endpoint
export const {
  useLoginMutation,
  useUserInfoQuery,
  useFindAllUsersQuery,
  useAddUserMutation,
  useLazyGetUserForUpdateByAdminQuery,
  useUpdateUserByAdminMutation,
  useGenerateUserTokenMutation,
  useGetAllUserDomainsMutation,
  useGetCustomerReportMutation,
  useGetResearchPartnerDateMutation,
  useGetDiscoveryAgentDataMutation,
  useGetSummaryUsageDataMutation,
  useGetSEOV3DataMutation,
  useGetSEOV4DataMutation,
  useGetBacklinkUsageDataMutation,
  useGetDefaultChecklistQuery,
  useAddDefaultChecklistMutation,
  useDeleteDefaultChecklistMutation,
  useUpdateDefaultChecklistMutation,
  useUploadImageMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useGetUserChecklistQuery,
  useGetTeamMembersQuery,
  useDeleteUserChecklistMutation,
  useUpdateUserChecklistMutation,
  useGetUserChecklistTaskCommentsQuery,
  useAddTaskCommentMutation,
  useLazyGetUserConfigurationQuery,
  useUpdateUserConfigurationMutation,

  // * Companies related
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useSetCompanyUsersMutation,
  useGetUserAdminPaginationMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} = bridgedApi;
