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
      query: ({ userId, data }) => ({
        url: `/User/Admin/UpdateByAdmin?userId=${userId}`,
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

    getTeamCredits: builder.query({
      queryFn: async () => {
        // Mock data response
        const mockData = [
          {
            team: {
              teamId: 'team-001',
              teamName: 'Frontend Squad',
              companyName: 'Bridged Media',
            },
            creditBalance: 1250,
            lastUpdated: '2026-01-23T10:36:10.436Z',
          },
          {
            team: {
              teamId: 'team-002',
              teamName: 'Backend Core',
              companyName: 'Techify',
            },
            creditBalance: 980,
            lastUpdated: '2026-01-20T08:15:42.112Z',
          },
          {
            team: {
              teamId: 'team-003',
              teamName: 'Design Team',
              companyName: 'Creative Labs',
            },
            creditBalance: 4300,
            lastUpdated: '2026-01-18T14:52:03.907Z',
          },
          {
            team: {
              teamId: 'team-004',
              teamName: 'DevOps Unit',
              companyName: 'CloudOps',
            },
            creditBalance: 670,
            lastUpdated: '2026-01-25T18:09:55.221Z',
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return { data: mockData };
      },
    }),

    getTeamCreditsHistory: builder.query({
      queryFn: async teamId => {
        // Mock data response
        const mockData = {
          team: {
            teamId: teamId || 'xyz',
            teamName: 'abcd',
            companyName: 'xyz',
          },
          history: [
            {
              amount: 500,
              purchaseData: {
                purchaseType: 'assign',
                reason: 'Purchase',
                notes: 'Credit package purchased',
                purchaseDate: new Date().toISOString(),
              },
            },
            {
              amount: 1000,
              purchaseData: {
                purchaseType: 'assign',
                reason: 'Grant',
                notes: 'Promotional credits',
                purchaseDate: new Date().toISOString(),
              },
            },
            {
              amount: 350,
              purchaseData: {
                purchaseType: 'deduct',
                reason: 'Adjustment',
                notes: 'Usage correction',
                purchaseDate: new Date().toISOString(),
              },
            },
          ],
          creditBalance: 1250,
          lastUpdated: new Date().toISOString(),
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return { data: mockData };
      },
    }),

    adjustTeamCredits: builder.mutation({
      queryFn: async data => {
        // Mock data response
        const mockData = {
          success: 'true',
          data: {
            team: { teamId: 'xyz', companyName: 'xyz' },
            creditBalance: 1234 || -1234,
            lastUpdated: '<Date()>',
          },
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return { data: mockData };
      },
    }),

    getCustomWork: builder.query({
      queryFn: async () => {
        // Mock data response
        const mockData = [
          {
            team: {
              teamId: '12345',
              teamName: 'Terrapinn Team B',
              companyName: 'Terrapinn',
            },
            creditUsageId: 'usage-001',
            creditsUsed: 1200,
            usageData: {
              customWorkTitle: 'Terrapinn – Scheduler Build',
              customWorkCategory: 'Custom Feature',
              customWorkStatus: 'pending',
              customWorkStartDate: '2026-01-10T09:00:00.000Z',
              customWorkEndDate: '2026-01-25T17:00:00.000Z',
              notes: 'Initial development phase in progress',
            },
          },
          {
            team: {
              teamId: '67890',
              teamName: 'Enterprise Ops',
              companyName: 'GlobalTech',
            },
            creditUsageId: 'usage-002',
            creditsUsed: 850,
            usageData: {
              customWorkTitle: 'Dashboard Performance Optimization',
              customWorkCategory: 'Improvement',
              customWorkStatus: 'completed',
              customWorkStartDate: '2025-12-01T08:30:00.000Z',
              customWorkEndDate: '2025-12-18T16:45:00.000Z',
              notes: 'Reduced API response time by 40%',
            },
          },
          {
            team: {
              teamId: '24680',
              teamName: 'Design Systems',
              companyName: 'Creative Labs',
            },
            creditUsageId: 'usage-003',
            creditsUsed: 400,
            usageData: {
              customWorkTitle: 'UI Component Library Expansion',
              customWorkCategory: 'Design',
              customWorkStatus: 'in-progress',
              customWorkStartDate: '2026-01-15T10:15:00.000Z',
              customWorkEndDate: '2026-02-05T18:00:00.000Z',
              notes: 'Adding new accessibility-compliant components',
            },
          },
          {
            team: {
              teamId: '13579',
              teamName: 'Platform Core',
              companyName: 'CloudOps',
            },
            creditUsageId: 'usage-004',
            creditsUsed: 2000,
            usageData: {
              customWorkTitle: 'Infrastructure Migration to Kubernetes',
              customWorkCategory: 'Infrastructure',
              customWorkStatus: 'approved',
              customWorkStartDate: '2026-02-01T07:00:00.000Z',
              customWorkEndDate: '2026-03-01T19:00:00.000Z',
              notes: 'High priority migration project',
            },
          },
        ];
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: mockData };
      },
    }),

    addCustomWork: builder.mutation({
      queryFn: async data => {
        // Mock data response
        const mockData = {
          success: true,
          data: {
            team: {
              teamId: '12345',
              teamName: 'Terrapinn Team B',
              companyName: 'Terrapinn',
            },
            creditUsageId: 'usage-009',
            creditsUsed: 1200,
            usageData: {
              customWorkTitle: 'Terrapinn – Scheduler Build',
              customWorkCategory: 'Custom Feature',
              customWorkStatus: 'pending',
              customWorkStartDate: '2026-01-12T09:30:00.000Z',
              customWorkEndDate: '2026-01-28T16:45:00.000Z',
              notes: 'Waiting for client approval before final deployment',
            },
          },
        };
        return { data: mockData };
      },
    }),

    editCustomWork: builder.mutation({
      queryFn: async data => {
        // Mock data response
        const mockData = {
          success: true,
          data: {
            team: {
              teamId: '12345',
              teamName: 'Terrapinn Team B',
              companyName: 'Terrapinn',
            },
            creditUsageId: 'usage-009',
            creditsUsed: 1200,
            usageData: {
              customWorkTitle: 'Terrapinn – Scheduler Build',
              customWorkCategory: 'Custom Feature',
              customWorkStatus: 'pending',
              customWorkStartDate: '2026-01-12T09:30:00.000Z',
              customWorkEndDate: '2026-01-28T16:45:00.000Z',
              notes: 'Waiting for client approval before final deployment',
            },
          },
        };
        return { data: mockData };
      },
    }),

    deleteCustomWork: builder.mutation({
      queryFn: async data => {
        // Mock data response
        const mockData = {
          success: true,
          data: {
            team: {
              teamId: '12345',
              teamName: 'Terrapinn Team B',
              companyName: 'Terrapinn',
            },
            creditUsageId: 'usage-009',
            creditsUsed: 1200,
            usageData: {
              customWorkTitle: 'Terrapinn – Scheduler Build',
              customWorkCategory: 'Custom Feature',
              customWorkStatus: 'pending',
              customWorkStartDate: '2026-01-12T09:30:00.000Z',
              customWorkEndDate: '2026-01-28T16:45:00.000Z',
              notes: 'Waiting for client approval before final deployment',
            },
          },
        };
        return { data: mockData };
      },
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

  // * Companies related
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useSetCompanyUsersMutation,
  useGetUserAdminPaginationMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetTeamCreditsQuery,
  useGetTeamCreditsHistoryQuery,
  useAdjustTeamCreditsMutation,
  useGetCustomWorkQuery,
  useAddCustomWorkMutation,
  useDeleteCustomWorkMutation,
  useEditCustomWorkMutation,
} = bridgedApi;
