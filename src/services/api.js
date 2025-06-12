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
  tagTypes: [
    'userInfo',
    'dashboard',
    'team',
    'cta',
    'eng',
    'domains',
    'pages',
    'agents',
    'collections',
    'actionBucket',
    'aiAgent',
    'onboarding',
    'aiLab',
  ],
  endpoints: builder => ({
    // ---------- User ------------
    // User registration mutation
    signUp: builder.mutation({
      query: data => ({
        url: '/User/Register',
        method: 'POST',
        body: data,
      }),
    }),

    // User login mutation
    login: builder.mutation({
      query: data => ({
        url: '/User/Login',
        method: 'POST',
        body: data,
      }),
    }),

    // Resend verification email code mutation
    resendVerifyEmailCode: builder.mutation({
      query: data => ({
        url: '/User/ResendVerificationCode',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify user's email mutation
    verifyUserEmail: builder.mutation({
      query: data => ({
        url: '/User/VerifyEmail',
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot password verification mutation
    forgotPasswordVerification: builder.mutation({
      query: data => ({
        url: '/User/ForgotPassword',
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot password mutation
    forgotPassword: builder.mutation({
      query: data => ({
        url: '/User/VerifyForgotCode',
        method: 'POST',
        body: data,
      }),
    }),

    // Google authentication query
    googleAuthentication: builder.query({
      query: accessToken => `/User/GoogleSignin?accessToken=${accessToken}`,
    }),

    // Facebook authentication query
    facebookAuthentication: builder.query({
      query: accessToken => `/User/FacebookSignin?accessToken=${accessToken}`,
    }),

    // ---------- Dashboard ------------

    dashboardOverview: builder.mutation({
      query: data => ({
        url: '/dashboard/Overview',
        method: 'POST',
        body: data,
      }),
    }),

    refreshDashboard: builder.mutation({
      query: () => ({
        url: '/Dashboard/RefreshDashboard',
        method: 'POST',
      }),
    }),

    // ------------------  Onboarding --------------

    getAllTasks: builder.query({
      query: () => '/Checklists/FindAll',
      providesTags: ['onboarding'],
    }),

    updateTask: builder.mutation({
      query: data => ({
        url: `Tasks/Completion?_id=${data._id}&isCompleted=${data.isCompleted}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['onboarding'],
    }),

    getTaskComments: builder.query({
      query: _id => `TaskComments/FindAllByTaskId/?_id=${_id}`,
      providesTags: ['onboarding'],
    }),

    createTaskComment: builder.mutation({
      query: data => ({
        url: 'TaskComments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['onboarding'],
    }),

    updateTaskComment: builder.mutation({
      query: data => ({
        url: `TaskComments?_id=${data?.commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['onboarding'],
    }),

    deleteTaskComment: builder.mutation({
      query: _id => ({
        url: `TaskComments?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['onboarding'],
    }),

    // ------------------  User --------------

    userInfo: builder.query({
      query: () => '/User/Profile',
      providesTags: ['userInfo'],
    }),

    updateUserInfo: builder.mutation({
      query: data => ({
        url: '/User/Profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['userInfo'],
    }),

    deleteUserAccount: builder.mutation({
      query: () => ({
        url: '/User',
        method: 'DELETE',
      }),
    }),

    changeUserPassword: builder.mutation({
      query: data => ({
        url: '/User/ChangePassword',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['userInfo'],
    }),

    // ---------- CTAs ------------
    createCta: builder.mutation({
      query: data => ({
        url: '/Action',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['cta'],
    }),

    editCta: builder.mutation({
      query: data => ({
        url: `/Action`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['cta'],
    }),

    deleteCta: builder.mutation({
      query: _id => ({
        url: `/Action?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['cta'],
    }),

    duplicateCta: builder.mutation({
      query: _id => ({
        url: `/Action/duplicate?_id=${_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['cta'],
    }),

    getAllUserCtas: builder.query({
      query: () => '/Action/UserAction',
      providesTags: ['cta'],
    }),

    getCtaById: builder.query({
      query: _id => `Action/FindById?_id=${_id}`,
      providesTags: ['cta'],
    }),

    // ---------- Engagements ------------

    createEng: builder.mutation({
      query: data => ({
        url: '/Engagement',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['eng'],
    }),

    editEng: builder.mutation({
      query: data => ({
        url: '/Engagement?constructionType=User_Generated',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['eng'],
    }),

    deleteEng: builder.mutation({
      query: _id => ({
        url: `/Engagement?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['eng'],
    }),

    duplicateEng: builder.mutation({
      query: _id => ({
        url: `/Engagement/duplicate?_id=${_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['eng'],
    }),

    getAllUserEng: builder.query({
      query: () => 'Engagement/UserEngagement',
      providesTags: ['eng'],
    }),

    getEngById: builder.query({
      query: _id => `Engagement/findWithId?_id=${_id}`,
      providesTags: ['eng'],
    }),

    // ---------- AI Engagement ------------
    getAllAIEng: builder.query({
      query: ({ pageNo, approvalState, search }) =>
        `EngagementsApprovalQueue/FindAll?approvalState=${approvalState}&pageNumber=${pageNo}&search=${search}`,
      providesTags: ['eng'],
    }),

    deleteAiEngagement: builder.mutation({
      query: data => ({
        url: `/Engagement/DeleteEngagementWithCampaignPageId`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['eng'],
    }),

    approveAIEng: builder.mutation({
      query: id => ({
        url: `/EngagementsApprovalQueue/Approve?engagementApprovalQueueIdString=${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['eng'],
    }),

    unApproveAIEng: builder.mutation({
      query: id => ({
        url: `/EngagementsApprovalQueue/Reject?engagementApprovalQueueIdString=${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['eng'],
    }),

    regenerateAIEngagement: builder.mutation({
      query: id => ({
        url: `/EngagementsApprovalQueue/Regenerate?engagementApprovalQueueIdString=${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['eng'],
    }),

    editAIEng: builder.mutation({
      query: data => ({
        url: `/Engagement`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['eng'],
    }),

    // ---------- End Screen ------------
    createEndScreen: builder.mutation({
      query: data => ({
        url: '/EndScreen',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['endScreen'],
    }),

    editEndScreen: builder.mutation({
      query: data => ({
        url: '/EndScreen',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['endScreen'],
    }),

    deleteEndScreen: builder.mutation({
      query: _id => ({
        url: `/EndScreen?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['endScreen'],
    }),

    duplicateEndScreen: builder.mutation({
      query: _id => ({
        url: `/EndScreen/duplicate?_id=${_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['endScreen'],
    }),

    getAllUserEndScreen: builder.query({
      query: () => 'EndScreen/FindAllCreatedUser',
      providesTags: ['endScreen'],
    }),

    getEndScreenById: builder.query({
      query: _id => `EndScreen/FindById?_id=${_id}`,
      providesTags: ['endScreen'],
    }),

    //  -------------- Collections ------------------
    createCollection: builder.mutation({
      query: data => ({
        url: '/actionBucket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    getAllUserCollections: builder.query({
      query: () => '/actionBucket',
      providesTags: ['collections'],
    }),

    deleteCollection: builder.mutation({
      query: _id => ({
        url: `/actionBucket?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['collections'],
    }),

    getCollectionOverview: builder.query({
      query: _id => `/actionBucket/overview?actionBucketId=${_id}`,
      providesTags: ['collections'],
    }),

    refreshCtaFromCollection: builder.mutation({
      query: data => ({
        url: '/actionBucket/RefreshActionFromActionBucket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    deleteCtaFromCollection: builder.mutation({
      query: data => ({
        url: '/actionBucket/DeleteActionFromActionBucket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['actionBucket'],
    }),

    deleteMediaFromCollection: builder.mutation({
      query: data => ({
        url: '/actionBucket/DeleteMediaFromActionBucket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['actionBucket'],
    }),

    addMediaToCollection: builder.mutation({
      query: data => ({
        url: '/actionBucket/AddMediaToActionBucket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['actionBucket'],
    }),

    addPageToCollection: builder.mutation({
      query: data => ({
        url: '/actionBucket/AddPageToActionBucket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    getWordpressPluginConnection: builder.query({
      query: id => `/WordpressPlugin/FindByDomainId?domainId=${id}`,
      providesTags: ['collections'],
    }),

    getAllSitemaps: builder.mutation({
      query: data => ({
        url: '/Domain/FetchSitemaps',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    refreshSitemap: builder.mutation({
      query: data => ({
        url: '/Domain/RefreshSitemaps',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    getXmlPageCrawlerStatus: builder.query({
      query: id => `/PageCrawler/xmlPageCrawlerStatus?domainId=${id}`,
      providesTags: ['collections'],
    }),

    startXMLCrawling: builder.mutation({
      query: data => ({
        url: '/PageCrawler/setupCrawler',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    addPageManuallyWithFile: builder.mutation({
      query: body => ({
        url: '/Page/addPageManuallyWithFile',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['collections'],
    }),

    getTargetPageList: builder.mutation({
      query: data => ({
        url: '/Page/getPagesByDomainId',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['collections'],
    }),

    getWordpressFilters: builder.query({
      query: domainId => `/Page/getAvailablePageFilterValues?domainId=${domainId}`,
      providesTags: ['collections'],
    }),

    //  -------------- Team ------------------
    createTeam: builder.mutation({
      query: () => ({
        url: '/team',
        method: 'POST',
      }),
      invalidatesTags: ['team'],
    }),

    getTeams: builder.query({
      query: () => '/team',
      providesTags: ['team'],
    }),

    getTeamById: builder.query({
      query: _id => `/team/teamMember?teamId=${_id}`,
      providesTags: ['team'],
    }),

    inviteTeamMember: builder.mutation({
      query: body => ({
        url: '/team/teamMember',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['team'],
    }),

    updateTeamMember: builder.mutation({
      query: body => ({
        url: '/team/teamMember',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['team'],
    }),

    deleteTeamMember: builder.mutation({
      query: _id => ({
        url: `/team/teamMember?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['team'],
    }),

    getPendingTeamInvites: builder.query({
      query: () => '/team/Invites',
      providesTags: ['team'],
    }),

    acceptTeamInvite: builder.mutation({
      query: _id => ({
        url: `/team/AcceptTeamInvitation?_id=${_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['team'],
    }),

    rejectTeamInvite: builder.mutation({
      query: _id => ({
        url: `/team/RejectTeamInvitation?_id=${_id}`,
        method: 'POST',
      }),
      invalidatesTags: ['team'],
    }),

    getTeamAccessableSections: builder.query({
      query: () => '/team/accessableSections',
      providesTags: ['team'],
    }),

    // ---------- Domains ------------

    getAllDomains: builder.query({
      query: () => '/Domain/FindAll',
      providesTags: ['domain'],
    }),

    createDomain: builder.mutation({
      query: body => ({
        url: '/Domain',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['domain'],
    }),

    verifyDomain: builder.mutation({
      query: id => ({
        url: `/Domain/Verify?_id=${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['domain'],
    }),

    deleteDomain: builder.mutation({
      query: _id => ({
        url: `/Domain?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['domain'],
    }),

    // ---------- Pages ------------

    getAllPages: builder.mutation({
      query: body => ({
        url: '/Page/FindPages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['pages'],
    }),

    getSinglePageData: builder.query({
      query: _id => `/Page/FindPageByIdWithCampaignInfo?pageId=${_id}`,
      providesTags: ['pages'],
    }),

    excludePageFromCampaign: builder.mutation({
      query: body => ({
        url: `/campaign/ExcludePageFromCampaign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['pages'],
    }),

    // ---------- Analytics ------------

    conversionRateChart: builder.mutation({
      query: ({ filters, type }) => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/ConversionRateChart?top_performing_filter=${type}`,
        method: 'POST',
        body: filters,
      }),
    }),

    engagementRateChart: builder.mutation({
      query: ({ filters, type }) => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/EngagementRateChart?top_performing_filter=${type}`,
        method: 'POST',
        body: filters,
      }),
    }),

    viewsChart: builder.mutation({
      query: ({ filters, type }) => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/ViewsChart?top_performing_filter=${type}`,
        method: 'POST',
        body: filters,
      }),
    }),

    timeSpent: builder.mutation({
      query: ({ filters, type }) => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/TimeSpent?top_performing_filter=${type}`,
        method: 'POST',
        body: filters,
      }),
    }),

    topActionCards: builder.mutation({
      query: body => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/TopActionCards`,
        method: 'POST',
        body,
      }),
    }),

    topEngagementCards: builder.mutation({
      query: body => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/TopEngagementCards`,
        method: 'POST',
        body,
      }),
    }),

    topEndScreenCards: builder.mutation({
      query: body => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/TopEndScreenCards`,
        method: 'POST',
        body,
      }),
    }),

    timeLineChart: builder.mutation({
      query: body => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Performance/TimeLineChart`,
        method: 'POST',
        body,
      }),
    }),

    topPerformingPages: builder.mutation({
      query: ({ filters, type }) => ({
        url: `/Analytics/Performance/TopPerformingPages?filter=${type}`,
        method: 'POST',
        body: filters,
      }),
    }),

    performanceChart: builder.mutation({
      query: filters => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Users/PerformanceChart`,
        method: 'POST',
        body: filters,
      }),
    }),

    countriesChart: builder.mutation({
      query: filters => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Users/Countries`,
        method: 'POST',
        body: filters,
      }),
    }),

    citiesChart: builder.mutation({
      query: filters => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Users/Cities`,
        method: 'POST',
        body: filters,
      }),
    }),

    browsersChart: builder.mutation({
      query: filters => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Users/Browsers`,
        method: 'POST',
        body: filters,
      }),
    }),

    devicesChart: builder.mutation({
      query: filters => ({
        url: `https://staging-ai-insights-and-trends-fekv67xtza-ew.a.run.app/Users/Devices`,
        method: 'POST',
        body: filters,
      }),
    }),

    // ---------- Agents ------------

    allAgents: builder.query({
      query: () => '/Campaign/FindAllUserCampaigns',
      providesTags: ['agents'],
    }),

    getAgentById: builder.query({
      query: id => `/Campaign/FindCampaignByIdForUpdate?campaignId=${id}`,
      providesTags: ['agents'],
    }),

    createAgent: builder.mutation({
      query: body => ({
        url: '/Campaign/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['agents'],
    }),

    updateAgent: builder.mutation({
      query: body => ({
        url: '/Campaign/UpdateCampaign',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['agents'],
    }),

    deleteAgent: builder.mutation({
      query: _id => ({
        url: `/Campaign/?campaignId=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['agents'],
    }),

    editAgent: builder.mutation({
      query: body => ({
        url: '/Campaign/UpdateCampaign',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['agents'],
    }),

    duplicateAgent: builder.mutation({
      query: id => ({
        url: `campaign/duplicate?campaignId=${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['agents'],
    }),

    editAgentState: builder.mutation({
      query: id => ({
        url: `/Campaign/ToggleState?campaignId=${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['agents'],
    }),

    createScreenFromTemplate: builder.mutation({
      query: body => ({
        url: '/Template',
        method: 'POST',
        body,
      }),
    }),

    getAgentOverviewCacheStatus: builder.mutation({
      query: body => ({
        url: '/Campaign/GetOverviewCacheStatus',
        method: 'POST',
        body,
      }),
    }),

    refreshAgentOverview: builder.mutation({
      query: body => ({
        url: '/Campaign/RefreshOverview',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewSummary: builder.mutation({
      query: body => ({
        url: '/Campaign/Overview/Summary',
        method: 'POST',
        body,
      }),
    }),

    agentActivity: builder.mutation({
      query: body => ({
        url: '/activity/campaignActivity',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewTimeline: builder.mutation({
      query: body => ({
        url: '/Campaign/OverviewTimeline',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewTopEngagements: builder.mutation({
      query: body => ({
        url: '/Campaign/Overview/TopEngagements',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewTopActions: builder.mutation({
      query: body => ({
        url: '/Campaign/Overview/TopActions',
        method: 'POST',
        body,
      }),
    }),

    agentIRISSessions: builder.mutation({
      query: body => ({
        url: '/Campaign/GetIRISSessions',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewWordCloud: builder.mutation({
      query: body => ({
        url: '/Campaign/GetWordCloud',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewWordCloudDownload: builder.mutation({
      query: body => ({
        url: '/Campaign/DownloadRagResult',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewFeedback: builder.mutation({
      query: body => ({
        url: '/Campaign/GetCampaignOverviewFeedback',
        method: 'POST',
        body,
      }),
    }),

    downloadAgentOverviewFeedback: builder.mutation({
      query: body => ({
        url: '/Campaign/DonwloadCampaignOverviewFeedback',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewPages: builder.mutation({
      query: body => ({
        url: '/Campaign/Overview/Pages',
        method: 'POST',
        body,
      }),
    }),

    agentOverviewPagesDownload: builder.mutation({
      query: id => ({
        url: `/Campaign/Overview/Pages/download/?campaignId=${id}`,
        method: 'POST',
      }),
    }),

    agentOverviewTopVisitors: builder.query({
      query: ({ id, pageNumber, startDate, endDate, limit }) =>
        `Campaign/Overview/Visitors?campaignId=${id}&pageNumber=${pageNumber}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
      invalidatesTags: ['agents'],
    }),

    uploadFont: builder.mutation({
      query: body => ({
        url: '/Media/font',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['fonts'],
    }),

    getAllFontHistory: builder.query({
      query: () => '/Media/FontsHistory',
      providesTags: ['fonts'],
    }),

    agentOverviewTopVisitorsDownload: builder.mutation({
      query: body => ({
        url: '/Campaign/Overview/Visitors/Download/',
        method: 'POST',
        body,
      }),
    }),

    AIGeneratedExamples: builder.mutation({
      query: body => ({
        url: '/Engagement/AIGeneratedExample',
        method: 'POST',
        body,
      }),
    }),

    getDomainConfigHistory: builder.query({
      query: _id => `/Campaign/GetDomainConfigHistory`,
      providesTags: ['campaign'],
    }),

    // ---------------------- AI Agent ----------------------

    AllAIAgents: builder.query({
      query: () => '/aiAgent/GetUserAIAGents',
      providesTags: ['aiAgent'],
    }),

    getAIAgentById: builder.query({
      query: id => `/aiAgent/GetUserAIAGentById?id=${id}`,
      providesTags: ['aiAgent'],
    }),

    createAIAgent: builder.mutation({
      query: body => ({
        url: '/aiAgent/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['aiAgent'],
    }),

    updateAIAgent: builder.mutation({
      query: body => ({
        url: '/aiAgent/update',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['aiAgent'],
    }),

    deleteAIAgent: builder.mutation({
      query: _id => ({
        url: `/aiAgent/Delete?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['aiAgent'],
    }),

    // ---------------------- Action Bucket ----------------------

    getAllActionBucket: builder.query({
      query: () => '/actionBucket',
      providesTags: ['actionBucket'],
    }),

    // ----------------------- Leads -----------------------

    getAllLeadsList: builder.mutation({
      query: body => ({
        url: '/Campaign/ContactsList',
        method: 'POST',
        body,
      }),
    }),

    downloadLeadsList: builder.mutation({
      query: body => ({
        url: '/Campaign/DownloadContactsList',
        method: 'POST',
        body,
      }),
    }),

    // ----------------------- Draft ---------------------

    getAllDrafts: builder.query({
      query: type => `/Draft/FindAllByDraftType?draftType=${type}`,
      providesTags: ['draft'],
    }),

    getSingleDraft: builder.query({
      query: _id => `/Draft/FindById?_id=${_id}`,
      providesTags: ['draft'],
    }),

    createDraft: builder.mutation({
      query: body => ({
        url: '/Draft/Create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['draft'],
    }),

    deleteDraft: builder.mutation({
      query: _id => ({
        url: `/Draft/Delete?_id=${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['draft'],
    }),

    // ----------------------- AI Lab -----------------------

    getAllEngines: builder.query({
      query: () => '/Engine/FindAll',
      providesTags: ['aiLab'],
    }),

    getEngineById: builder.query({
      query: _id => `/Engine/FindById?_id=${_id}`,
      providesTags: ['aiLab'],
    }),

    deleteEngine: builder.mutation({
      query: _id => ({
        url: `/Engine/?_id${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['aiLab'],
    }),

    createEngine: builder.mutation({
      query: body => ({
        url: '/Engine/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['aiLab'],
    }),

    updateEngine: builder.mutation({
      query: body => ({
        url: `/Engine?_id=${body?._id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['aiLab'],
    }),

    simulateEngine: builder.mutation({
      query: body => ({
        url: '/Engine/SimulateEngine',
        method: 'POST',
        body,
      }),
    }),

    generateGuideline: builder.mutation({
      query: body => ({
        url: '/Engine/GenerateGuideline',
        method: 'POST',
        body,
      }),
    }),

    // ----------------------- Etc -----------------------
    uploadImage: builder.mutation({
      query: body => ({
        url: '/Media/image',
        method: 'POST',
        body,
      }),
    }),

    uploadDocument: builder.mutation({
      query: body => ({
        url: '/Media/document',
        method: 'POST',
        body,
      }),
    }),

    deleteImage: builder.mutation({
      query: body => ({
        url: '/Media',
        method: 'DELETE',
        body,
      }),
    }),

    Feedback: builder.mutation({
      query: data => ({
        url: '/Dashboard/Feedback',
        method: 'POST',
        body: data,
      }),
    }),

    Support: builder.mutation({
      query: data => ({
        url: '/Dashboard/Support',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks for each endpoint
export const {
  // User
  useSignUpMutation,
  useLoginMutation,
  useResendVerifyEmailCodeMutation,
  useVerifyUserEmailMutation,
  useForgotPasswordVerificationMutation,
  useForgotPasswordMutation,
  useGoogleAuthenticationQuery,
  useFacebookAuthenticationQuery,
  // ---------- Dashboard ------------
  useDashboardOverviewMutation,
  useRefreshDashboardMutation,
  // ------------------  Onboarding --------------
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useGetTaskCommentsQuery,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,
  // ------------------  User --------------
  useUserInfoQuery,
  useUpdateUserInfoMutation,
  useDeleteUserAccountMutation,
  useChangeUserPasswordMutation,
  // ---------- CTAs ------------
  useCreateCtaMutation,
  useEditCtaMutation,
  useDeleteCtaMutation,
  useDuplicateCtaMutation,
  useGetAllUserCtasQuery,
  useGetCtaByIdQuery,
  // ---------- Engagements ------------
  useCreateEngMutation,
  useEditEngMutation,
  useDeleteEngMutation,
  useDuplicateEngMutation,
  useGetAllUserEngQuery,
  useGetEngByIdQuery,
  // ---------- AI Engagement ------------
  useGetAllAIEngQuery,
  useDeleteAiEngagementMutation,
  useApproveAIEngMutation,
  useUnApproveAIEngMutation,
  useRegenerateAIEngagementMutation,
  useEditAIEngMutation,
  // ---------- End Screen ------------
  useCreateEndScreenMutation,
  useEditEndScreenMutation,
  useDeleteEndScreenMutation,
  useDuplicateEndScreenMutation,
  useGetAllUserEndScreenQuery,
  useGetEndScreenByIdQuery,
  //  -------------- Collections ------------------
  useCreateCollectionMutation,
  useGetAllUserCollectionsQuery,
  useDeleteCollectionMutation,
  useGetWordpressPluginConnectionQuery,
  useGetAllSitemapsMutation,
  useRefreshSitemapMutation,
  useGetXmlPageCrawlerStatusQuery,
  useStartXMLCrawlingMutation,
  useAddPageManuallyWithFileMutation,
  useGetTargetPageListMutation,
  //  -------------- Team ------------------
  useCreateTeamMutation,
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useGetPendingTeamInvitesQuery,
  useAcceptTeamInviteMutation,
  useRejectTeamInviteMutation,
  useGetTeamAccessableSectionsQuery,
  // ---------- Domains ------------
  useGetAllDomainsQuery,
  useCreateDomainMutation,
  useVerifyDomainMutation,
  useDeleteDomainMutation,
  // ---------- Pages ------------
  useGetAllPagesMutation,
  useGetSinglePageDataQuery,
  useExcludePageFromCampaignMutation,
  // ---------- Analytics ------------
  useConversionRateChartMutation,
  useEngagementRateChartMutation,
  useViewsChartMutation,
  useTimeSpentMutation,
  useTopActionCardsMutation,
  useTopEngagementCardsMutation,
  useTopEndScreenCardsMutation,
  useTimeLineChartMutation,
  usePerformanceChartMutation,
  useCountriesChartMutation,
  useCitiesChartMutation,
  useBrowsersChartMutation,
  useDevicesChartMutation,
  // ---------- Agents ------------
  useAllAgentsQuery,
  useGetAgentByIdQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useEditAgentMutation,
  useDuplicateAgentMutation,
  useEditAgentStateMutation,
  useCreateScreenFromTemplateMutation,
  useRefreshAgentOverviewMutation,
  useGetAgentOverviewCacheStatusMutation,
  useAgentOverviewSummaryMutation,
  useAgentActivityMutation,
  useAgentOverviewTimelineMutation,

  useUploadFontMutation,
  useGetAllFontHistoryQuery,
  useAgentOverviewTopEngagementsMutation,
  useAgentOverviewTopActionsMutation,
  useAgentIRISSessionsMutation,
  useAgentOverviewWordCloudMutation,
  useAgentOverviewWordCloudDownloadMutation,
  useAgentOverviewFeedbackMutation,
  useDownloadAgentOverviewFeedbackMutation,
  useAgentOverviewPagesMutation,
  useAgentOverviewPagesDownloadMutation,
  useAgentOverviewTopVisitorsQuery,
  useAgentOverviewTopVisitorsDownloadMutation,
  useAIGeneratedExamplesMutation,
  useGetDomainConfigHistoryQuery,
  // ---------------------- AI Agent ----------------------
  useAllAIAgentsQuery,
  useGetAIAgentByIdQuery,
  useCreateAIAgentMutation,
  useUpdateAIAgentMutation,
  useDeleteAIAgentMutation,
  // ---------------------- Action Bucket ----------------------
  useGetAllActionBucketQuery,
  useGetCollectionOverviewQuery,
  useRefreshCtaFromCollectionMutation,
  useDeleteCtaFromCollectionMutation,
  useDeleteMediaFromCollectionMutation,
  useAddPageToCollectionMutation,
  useAddMediaToCollectionMutation,
  useGetWordpressFiltersQuery,
  // ----------------------- Leads -----------------------
  useGetAllLeadsListMutation,
  useDownloadLeadsListMutation,
  // ----------------------- Draft ---------------------
  useGetAllDraftsQuery,
  useGetSingleDraftQuery,
  useCreateDraftMutation,
  useDeleteDraftMutation,
  // ----------------------- AI Lab -----------------------
  useGetAllEnginesQuery,
  useGetEngineByIdQuery,
  useDeleteEngineMutation,
  useCreateEngineMutation,
  useUpdateEngineMutation,
  useSimulateEngineMutation,
  useGenerateGuidelineMutation,
  // ----------------------- Etc -----------------------
  useUploadImageMutation,
  useDeleteImageMutation,
  useFeedbackMutation,
  useSupportMutation,
  useUploadDocumentMutation,
} = bridgedApi;
