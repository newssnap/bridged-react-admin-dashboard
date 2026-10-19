import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useCreateTeamMutation,
  useGetUsersWithNoTeamQuery,
} from '../../../services/api';

export const useAddTeamDrawerHandler = (isEditTeamDrawerOpen = false) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [companySearchText, setCompanySearchText] = useState('');

  const {
    data: companiesResponse,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useGetCompaniesQuery(
    { page: 1, limit: 500, search: companySearchText || '' },
    { skip: !isDrawerOpen }
  );

  const isAnyTeamDrawerOpen = isDrawerOpen || isEditTeamDrawerOpen;

  const { data: usersResponse, isLoading: isUsersLoading } = useGetUsersWithNoTeamQuery(undefined, {
    skip: !isAnyTeamDrawerOpen,
  });

  const [createTeam, { isLoading: isSubmitting }] = useCreateTeamMutation();
  const [createCompanyMutation, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();

  const companiesList = useMemo(() => companiesResponse?.data?.data ?? [], [companiesResponse]);
  const companyOptions = useMemo(
    () => companiesList.map(c => ({ value: c.id, label: c.name || '—' })),
    [companiesList]
  );

  const usersList = useMemo(() => usersResponse?.data ?? [], [usersResponse]);
  const userOptions = useMemo(
    () =>
      usersList.map(u => ({
        value: u._id,
        label: u.fullname ? `${u.fullname} (${u.email})` : u.email || u._id,
        fullname: u.fullname,
        email: u.email,
      })),
    [usersList]
  );

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setCompanySearchText('');
  };

  const onCompanyChange = () => {
    // No longer loads users by company; kept for form clearing in drawers
  };

  const handleCompanySearch = value => {
    setCompanySearchText(value ?? '');
  };

  const createCompany = async values => {
    const companyName = values?.name?.trim();
    if (!companyName) return null;

    try {
      const result = await createCompanyMutation(companyName).unwrap();
      toast.success('Company created');

      await refetchCompanies();
      setCompanySearchText('');

      return result?.id || result?.data?.id || result?.data?.data?.id || result?._id || null;
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't create the company");
      return null;
    }
  };

  const handleSubmit = async values => {
    try {
      const teamMembers = (values.memberIds ?? []).map(userId => ({
        userId,
        accessConfigs: [],
      }));

      const payload = {
        title: values.teamName?.trim() || '',
        companyId: values.companyId,
        teamOwnerId: values.teamOwnerId,
        isWhitelabelingEnabled: !!values.isWhitelabelingEnabled,
        isAgentVisualizationEnabled:
          values.isAgentVisualizationEnabled !== undefined
            ? !!values.isAgentVisualizationEnabled
            : !!values.isBrandSyncEnabled,
        teamMembers,
        playbookIds: values.playbookIds ?? [],
      };

      if (payload.isWhitelabelingEnabled) {
        payload.dashboardURL = values.dashboardURL?.trim() ?? '';
        payload.primaryColor = values.primaryColor ?? '';
        payload.logo = values.logoUrl?.trim() ?? '';
      }

      if (payload.isAgentVisualizationEnabled) {
        payload.agentVisualizationConfig = {
          primaryColor:
            values.agentVisualizationConfig?.primaryColor ??
            values.brandSyncPrimaryColor ??
            values.brandSync?.primaryColor ??
            '',
          accentColour:
            values.agentVisualizationConfig?.accentColour ??
            values.brandSyncAccentColour ??
            values.brandSync?.accentColour ??
            '',
          logo:
            values.agentVisualizationConfig?.logo ??
            values.brandSyncLogo?.trim() ??
            values.brandSync?.logo ??
            '',
          theme:
            values.agentVisualizationConfig?.theme ??
            values.brandSyncTheme ??
            values.brandSync?.theme ??
            'light',
          fontName:
            values.agentVisualizationConfig?.fontName ??
            values.brandSyncFontName?.trim() ??
            values.brandSync?.fontName ??
            '',
          baseFontScale:
            values.agentVisualizationConfig?.baseFontScale ??
            values.brandSyncBaseFontScale ??
            values.brandSync?.baseFontScale ??
            null,
          borderRadius:
            values.agentVisualizationConfig?.borderRadius ??
            values.brandSyncBorderRadius?.trim() ??
            values.brandSync?.borderRadius ??
            '',
        };
      }

      const response = await createTeam(payload).unwrap();
      if (response?.success) {
        toast.success('Team created');
        closeDrawer();
      } else {
        toast.error(response?.data?.errorObject?.userErrorText || "Couldn't create the team");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.errorObject?.userErrorText || "Couldn't create the team");
    }
  };

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    companyOptions,
    userOptions,
    isUsersLoading,
    isLoadingCompanies,
    onCompanyChange,
    companySearchText,
    handleCompanySearch,
    createCompany,
    isCreatingCompany,
    handleSubmit,
    isSubmitting,
  };
};
