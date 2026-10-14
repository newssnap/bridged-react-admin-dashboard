import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { useForm } from '@/components/form';
import { useDashboardHandler } from '../controllers/useDashboardHandler';
import useUsersTableHandler from '../controllers/useUsersTableHandler';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import { useReportHandler } from '../controllers/useReportHandler';
import { useAgentManagementHandler } from '../controllers/useAgentManagementHandler';
import { API_URL } from '../../../config/Config';
import { openUserPortal } from '../../../utils/controllers/openUserPortal';
import {
  useCreateCompanyMutation,
  useGetCompaniesQuery,
  useGetTeamsByCompanyQuery,
  useLazyGetUserForUpdateByAdminQuery,
  useOAuthAuthorizeMutation,
  useUpdateUserByAdminMutation,
} from '../../../services/api';
import { parseOAuthAuthorizePayload } from '../../../utils/controllers/oauthRedirect';
import AccountsToolbar from '../components/AccountsToolbar';
import AccountsTable from '../components/AccountsTable';
import { plural } from '../components/AccountParts';
import UserDrawer from '../components/UserDrawer';
import ExportReportDrawer from '../components/ExportReportDrawer';
import ClaudeRedirectOverlay from '../components/ClaudeRedirectOverlay';

const getCreatedCompanyId = createdCompany =>
  createdCompany?.id ||
  createdCompany?.data?.id ||
  createdCompany?.data?.data?.id ||
  createdCompany?._id;

function DashboardWorkflow() {
  const {
    inputQuery: searchText,
    debouncedValue: debouncedSearchText,
    inputHandler,
  } = useDebouncedInput('');

  const { debouncedValue: debouncedCompanySearchText, inputHandler: companySearchInputHandler } =
    useDebouncedInput('');

  const [_CREATE_COMPANY, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();

  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const {
    users,
    total,
    page,
    limit,
    handlePageChange,
    refetchUsers,
    isLoading,
    isError,
    handleUpdateUserStatus,
  } = useUsersTableHandler(
    debouncedSearchText,
    selectedCompanyId,
    selectedTeamId,
    'all',
    'lastLogin_DESC'
  );

  const {
    data: companies,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useGetCompaniesQuery({
    page: 1,
    limit: 100,
    search: debouncedCompanySearchText || '',
  });

  const companyOptions = useMemo(
    () =>
      (companies?.data?.data ?? []).map(company => ({
        label: company.name,
        value: company.id,
      })),
    [companies]
  );

  const isDashboardCompanySelected = selectedCompanyId && selectedCompanyId !== 'all';

  const { data: teamsResponse, isLoading: isLoadingTeams } = useGetTeamsByCompanyQuery(
    selectedCompanyId,
    { skip: !isDashboardCompanySelected }
  );
  const teamsList = teamsResponse?.data ?? [];
  const teamOptions = [
    { label: 'All teams', value: 'all' },
    ...(isDashboardCompanySelected
      ? teamsList.map(team => ({
          label: team.title || team.companyName || team._id || '—',
          value: team._id,
        }))
      : []),
  ];

  const {
    handleAddUser,
    isAddingUser,
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
  } = useDashboardHandler();

  const [isAddUserDrawerOpen, setIsAddUserDrawerOpen] = useState(false);
  const [isEditUserDrawerOpen, setIsEditUserDrawerOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [addUserForm] = useForm();
  const [editUserForm] = useForm();
  const [reportForm] = useForm();
  const [_GET_USER_FOR_UPDATE, { isFetching: isFetchingUserForUpdate }] =
    useLazyGetUserForUpdateByAdminQuery();
  const [_UPDATE_USER, { isLoading: isUpdatingUser }] = useUpdateUserByAdminMutation();

  const {
    userDomains,
    handleGenerateUserToken,
    handleCustomerReport,
    isGeneratingToken,
    handleUsageReport,
    reportGenerateLoading,
    generateTokenID,
  } = useReportHandler();

  const [selectedReportTypes, setSelectedReportTypes] = useState([]);

  // Agent access is saved with the user (the pickers are switched off for now).
  const {
    resetExistingUserAgentStates,
    initializeExistingUserAgentStates,
    generateExistingUserConfigurations,
    resetNewUserAgentStates,
    generateNewUserConfigurations,
  } = useAgentManagementHandler();

  const location = useLocation();
  const [_OAUTH_AUTHORIZE, { isLoading: isAuthorizingOAuth }] = useOAuthAuthorizeMutation();
  const [authorizingUserId, setAuthorizingUserId] = useState(null);
  const [isRedirectingToClaude, setIsRedirectingToClaude] = useState(false);

  const oauthAuthorizePayload = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return parseOAuthAuthorizePayload(searchParams.get('oauth_redirect'));
  }, [location.search]);
  const isConnectMode = Boolean(oauthAuthorizePayload);

  const handleMenuClick = async (key, record) => {
    const tokens = await handleGenerateUserTokenForLogin(
      {
        _id: record._id,
      },
      key
    );
    // A failed token request has already been reported by the handler.
    if (!tokens?.accessToken) return;

    if (key === 'dashboard') {
      if (API_URL.includes('stg')) {
        window.open(
          `https://stg-dashboard.bridged.media/?accessToken=${tokens.accessToken}`,
          '_blank'
        );
      } else {
        window.open(`https://dashboard.bridged.media/?accessToken=${tokens.accessToken}`, '_blank');
      }
    } else if (key === 'portal') {
      openUserPortal(tokens.accessToken, tokens.refreshToken);
    } else if (key === 'plugin') {
      window.postMessage(
        {
          source: 'qweek-website',
          payload: {
            type: 'LOGIN_TOKEN',
            token: tokens.accessToken,
          },
        },
        '*'
      );
      window.addEventListener('message', event => {
        if (event.source !== window) return;

        const message = event.data;

        if (message?.source === 'qweek-website' && message.payload?.type === 'LOGIN_STATUS') {
          if (message.payload.status === 'success') {
            toast.success('Signed in to the plugin');
          } else {
            toast.error("Couldn't sign in to the plugin");
          }
        }
      });
    }
  };

  const handleConnectToClaude = async record => {
    if (!oauthAuthorizePayload) {
      toast.error("Couldn't connect to Claude", {
        description: 'The OAuth details in the link are missing or invalid.',
      });
      return;
    }

    if (!record?._id || !record?.teamId) {
      toast.warning('Pick a user who belongs to a team');
      return;
    }

    try {
      setAuthorizingUserId(record._id);
      const response = await _OAUTH_AUTHORIZE({
        ...oauthAuthorizePayload,
        selected_user_id: record._id,
        selected_team_id: record.teamId,
      }).unwrap();

      const redirectUrl = response?.data?.redirect_url || response?.redirect_url;

      if (!redirectUrl) {
        toast.error("Couldn't connect to Claude", {
          description: "The server didn't send a link back to Claude.",
        });
        setAuthorizingUserId(null);
        return;
      }

      setIsRedirectingToClaude(true);

      setTimeout(() => {
        window.location.assign(redirectUrl);
      }, 1800);
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't connect to Claude");
      setAuthorizingUserId(null);
      setIsRedirectingToClaude(false);
    }
  };

  const handleAddUserSubmit = async values => {
    const userConfigurations = generateNewUserConfigurations();
    const userDataWithConfig = {
      username: values.username,
      password: values.password,
      userConfigurations,
      firstName: values.firstName ?? '',
      lastName: values.lastName ?? '',
      profilePhoto: values.profilePhoto ?? '',
      teamId: values.teamId ?? '',
    };
    await handleAddUser(userDataWithConfig, handleCloseAddUserDrawer);
    refetchUsers();
  };

  const handleUpdateUserSubmit = async values => {
    if (!editingUserId) return;
    try {
      const data = {
        userConfigurations: generateExistingUserConfigurations(),
        ...(values.password ? { password: values.password } : {}),
        ...(values.firstName != null && { firstName: values.firstName }),
        ...(values.lastName != null && { lastName: values.lastName }),
        ...(values.profilePhoto != null &&
          values.profilePhoto !== '' && { profilePhoto: values.profilePhoto }),
        ...(Object.prototype.hasOwnProperty.call(values, 'teamId') && {
          teamId: values.teamId || '',
        }),
      };

      const response = await _UPDATE_USER({ userId: editingUserId, data }).unwrap();

      if (response?.success) {
        toast.success('User updated');
        handleCloseEditUserDrawer();
        refetchUsers();
      } else {
        toast.error(response?.errorObject?.userErrorText || "Couldn't update the user");
      }
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't update the user");
    }
  };

  const handleOpenCreateUserDrawer = () => {
    setEditingUserId(null);
    addUserForm.resetFields();
    resetNewUserAgentStates();
    setIsAddUserDrawerOpen(true);
  };

  const handleOpenEditUserDrawer = async record => {
    setEditingUserId(record?._id);
    setIsEditUserDrawerOpen(true);
    setEditingUserData(null);
    resetExistingUserAgentStates();

    editUserForm.setFieldsValue({
      username: record?.email || '',
      password: '',
      firstName: '',
      lastName: '',
      profilePhoto: '',
      company: undefined,
      teamId: undefined,
    });

    try {
      const response = await _GET_USER_FOR_UPDATE(record?._id).unwrap();
      if (response?.success) {
        const user = response?.data;
        setEditingUserData(user);
        initializeExistingUserAgentStates(user?.userConfigurations);
        const fullname = (user?.fullname || '').trim();
        const nameParts = fullname ? fullname.split(/\s+/) : [];
        const firstName = nameParts[0] ?? '';
        const lastName = nameParts.slice(1).join(' ') ?? '';
        editUserForm.setFieldsValue({
          username: user?.email || record?.email || '',
          password: '',
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          profilePhoto: user?.picture || user?.profilePhoto || undefined,
          company: user?.company?.id || user?.company?._id || record?.company?.id || undefined,
          teamId: user?.teamId || user?.team?._id || record?.teamId || undefined,
        });
      } else {
        toast.error(response?.errorObject?.userErrorText || "Couldn't load the user");
      }
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't load the user");
    }
  };

  const handleCloseAddUserDrawer = () => {
    addUserForm.resetFields();
    setIsAddUserDrawerOpen(false);
    setEditingUserId(null);
    resetNewUserAgentStates();
  };

  const handleCloseEditUserDrawer = () => {
    editUserForm.resetFields();
    setIsEditUserDrawerOpen(false);
    setEditingUserId(null);
    setEditingUserData(null);
    resetExistingUserAgentStates();
  };

  const handleCloseReportDrawer = () => {
    reportForm.resetFields();
    setSelectedReportTypes([]);
    setIsExportReportOpen(false);
  };

  const handleGenerateReport = async () => {
    try {
      const values = await reportForm.validateFields();

      if (selectedReportTypes.includes('customer')) {
        await handleCustomerReport({
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
        });
      }
      if (selectedReportTypes.includes('productivity')) {
        await handleUsageReport({
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
          hostnames: values.domain,
        });
      }

      handleCloseReportDrawer();
    } catch (error) {
      console.error('Report generation error:', error);
    }
  };

  const handleReportTypeChange = checkedValues => {
    setSelectedReportTypes(checkedValues);
  };

  const handleExportReportClick = async record => {
    try {
      await handleGenerateUserToken({
        _id: record._id,
      });
      setIsExportReportOpen(true);
    } catch (error) {
      console.error('Error generating user token:', error);
      toast.error("Couldn't load the user's reports");
    }
  };

  const createCompany = async values => {
    try {
      const result = await _CREATE_COMPANY(values.name).unwrap();

      toast.success('Company created');

      // Select the new company in the add user drawer once the list has it.
      await handleCompanyCreated(result);

      return result;
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't create the company");
    }
  };

  const handleCompanyCreated = async createdCompany => {
    if (createdCompany) {
      const companyId = getCreatedCompanyId(createdCompany);

      if (companyId) {
        // Refetch companies to ensure the new company appears in the list
        await refetchCompanies();

        // Small delay to ensure the options are updated
        setTimeout(() => {
          if (isAddUserDrawerOpen) {
            addUserForm.setFieldValue('company', companyId);
          }
        }, 100);
      }
    }
  };

  // "Create “name”" in the toolbar's company filter: create it, then filter by it.
  const handleAddCompanyFromDashboardSelect = async name => {
    const companyName = (name || '').trim();

    if (!companyName) {
      toast.warning('Enter a company name');
      return undefined;
    }

    const createdCompany = await createCompany({ name: companyName });
    const createdCompanyId = getCreatedCompanyId(createdCompany);

    if (createdCompanyId) {
      setSelectedTeamId('all');
    }
    return createdCompanyId;
  };

  const handleCompanyFilterChange = value => {
    setSelectedCompanyId(value);
    setSelectedTeamId('all');
  };

  const handleResetFilters = () => {
    setSelectedCompanyId('all');
    setSelectedTeamId('all');
  };

  const isRowBusy = record =>
    (isGeneratingTokenForLogin && generateTokenIDLogin === record?._id) ||
    (isGeneratingToken && generateTokenID === record?._id);

  const hasFilters = selectedCompanyId !== 'all' || selectedTeamId !== 'all';
  const countLabel = isLoading || isError ? null : plural(total || 0, 'user');

  return (
    <div className="flex flex-col gap-8">
      <ClaudeRedirectOverlay open={isRedirectingToClaude} />

      <PageHeader
        title={isConnectMode ? 'Connect to Claude' : 'Accounts'}
        description={
          isConnectMode
            ? 'Pick the account Claude should work as. It needs to belong to a team.'
            : 'Every user on Bridged: add accounts, edit their details and sign in as them.'
        }
        actions={
          isConnectMode ? null : (
            <Button type="button" onClick={handleOpenCreateUserDrawer}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              Add user
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-6">
        <AccountsToolbar
          companyOptions={companyOptions}
          isLoadingCompanies={isLoadingCompanies}
          onCompanySearch={companySearchInputHandler}
          onCreateCompany={handleAddCompanyFromDashboardSelect}
          isCreatingCompany={isCreatingCompany}
          companyId={selectedCompanyId}
          onCompanyChange={handleCompanyFilterChange}
          teamOptions={teamOptions}
          isLoadingTeams={isLoadingTeams}
          teamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          onResetFilters={handleResetFilters}
          countLabel={countLabel}
          searchText={searchText}
          onSearchChange={inputHandler}
          searchPlaceholder={isConnectMode ? 'Search users to connect' : 'Search by email'}
        />

        <AccountsTable
          users={Array.isArray(users) ? users : []}
          total={total || 0}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetchUsers}
          query={debouncedSearchText}
          hasFilters={hasFilters}
          onClearSearch={() => inputHandler('')}
          onResetFilters={handleResetFilters}
          onAddUser={handleOpenCreateUserDrawer}
          onRowClick={handleOpenEditUserDrawer}
          isConnectMode={isConnectMode}
          onConnect={handleConnectToClaude}
          connectingUserId={isAuthorizingOAuth || isRedirectingToClaude ? authorizingUserId : null}
          isRowBusy={isRowBusy}
          actions={{
            onEdit: handleOpenEditUserDrawer,
            onExportReport: handleExportReportClick,
            onLoginPortal: record => handleMenuClick('portal', record),
            onLoginPlugin: record => handleMenuClick('plugin', record),
            onUpdateStatus: record =>
              handleUpdateUserStatus(
                record._id,
                record?.status === 'inactive' ? 'activate' : 'deactivate'
              ),
          }}
        />
      </div>

      <UserDrawer
        open={isAddUserDrawerOpen}
        onClose={handleCloseAddUserDrawer}
        form={addUserForm}
        onSubmit={handleAddUserSubmit}
        isSubmitting={isAddingUser}
        companyOptions={companyOptions}
        isLoadingCompanies={isLoadingCompanies}
        onCompanySearch={companySearchInputHandler}
        createCompany={createCompany}
        isCreatingCompany={isCreatingCompany}
      />

      <UserDrawer
        isEditing
        open={isEditUserDrawerOpen}
        onClose={handleCloseEditUserDrawer}
        form={editUserForm}
        onSubmit={handleUpdateUserSubmit}
        isSubmitting={isUpdatingUser}
        isLoadingUser={isFetchingUserForUpdate}
        userData={editingUserData}
        companyOptions={companyOptions}
        isLoadingCompanies={isLoadingCompanies}
        onCompanySearch={companySearchInputHandler}
      />

      <ExportReportDrawer
        open={isExportReportOpen}
        onClose={handleCloseReportDrawer}
        form={reportForm}
        onGenerate={handleGenerateReport}
        isGenerating={reportGenerateLoading}
        selectedReportTypes={selectedReportTypes}
        onReportTypesChange={handleReportTypeChange}
        userDomains={userDomains}
      />
    </div>
  );
}

export default DashboardWorkflow;
