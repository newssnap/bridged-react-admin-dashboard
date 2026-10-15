import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from '@/components/form';
import {
  useUpdateTeamMutation,
  useGetCompaniesQuery,
  useGetAdminTeamMembersQuery,
  useCreateCompanyMutation,
  useDeleteTeamMemberMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../../services/api';
import { useDashboardHandler } from '../../dashboard/controllers/useDashboardHandler';
import { openUserPortal } from '../../../utils/controllers/openUserPortal';

export const useEditTeamDrawerHandler = (refetchTeams, onCompanyChange) => {
  const [form] = useForm();
  const [editTeamDrawerOpen, setEditTeamDrawerOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState(null);
  const [companySearchText, setCompanySearchText] = useState('');

  const teamId = selectedTeamForEdit?._id;
  const open = editTeamDrawerOpen;
  const team = selectedTeamForEdit;

  const [updateTeam, { isLoading: isSubmitting }] = useUpdateTeamMutation();
  const [deleteTeamMember] = useDeleteTeamMemberMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [deletingId, setDeletingId] = useState(null);

  const {
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
  } = useDashboardHandler();

  const {
    data: companiesResponse,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useGetCompaniesQuery(
    { page: 1, limit: 500, search: companySearchText || '' },
    { skip: !open }
  );
  const [createCompanyMutation, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();

  const companiesList = useMemo(() => companiesResponse?.data?.data ?? [], [companiesResponse]);
  const companyOptions = useMemo(
    () => (open ? companiesList.map(c => ({ value: c.id, label: c.name || '—' })) : []),
    [open, companiesList]
  );

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    refetch: refetchTeamMembers,
  } = useGetAdminTeamMembersQuery(teamId, {
    skip: !open || !teamId,
  });

  const members = useMemo(() => membersData?.data ?? [], [membersData]);

  const closeEditDrawer = useCallback(() => {
    setEditTeamDrawerOpen(false);
    setCompanySearchText('');
    setTimeout(() => setSelectedTeamForEdit(null), 300);
  }, []);

  const openEditDrawer = useCallback(record => {
    setSelectedTeamForEdit(record);
    setEditTeamDrawerOpen(true);
  }, []);

  const onSuccess = useCallback(() => {
    refetchTeams?.();
  }, [refetchTeams]);

  useEffect(() => {
    if (!open || !team) return;
    const companyId = companyOptions?.find(o => o.label === team.companyName)?.value;
    const dashboardSubdomain = team.dashboardURL?.endsWith('.bridged.media')
      ? team.dashboardURL.replace('.bridged.media', '')
      : (team.dashboardURL ?? undefined);
    form.setFieldsValue({
      teamName: team.teamName ?? undefined,
      companyId: companyId ?? undefined,
      isSponsorsActive: !!team.isSponsorsActive,
      isWhitelabelingEnabled: !!team.isWhitelabelingEnabled,
      isBrandSyncEnabled:
        team.isAgentVisualizationEnabled !== undefined
          ? !!team.isAgentVisualizationEnabled
          : !!team.isBrandSyncEnabled,
      dashboardURL: dashboardSubdomain,
      primaryColor: team.primaryColor ?? '#753fd0',
      logoUrl: team.logo ?? undefined,
      brandSyncPrimaryColor:
        team.agentVisualizationConfig?.primaryColor ?? team.brandSync?.primaryColor ?? undefined,
      brandSyncAccentColour:
        team.agentVisualizationConfig?.accentColour ?? team.brandSync?.accentColour ?? undefined,
      brandSyncLogo: team.agentVisualizationConfig?.logo ?? team.brandSync?.logo ?? undefined,
      brandSyncTheme: team.agentVisualizationConfig?.theme ?? team.brandSync?.theme ?? 'light',
      brandSyncFontName:
        team.agentVisualizationConfig?.fontName ?? team.brandSync?.fontName ?? undefined,
      brandSyncBaseFontScale:
        team.agentVisualizationConfig?.baseFontScale ?? team.brandSync?.baseFontScale ?? undefined,
      brandSyncBorderRadius:
        team.agentVisualizationConfig?.borderRadius ?? team.brandSync?.borderRadius ?? undefined,
    });
    if (companyId) {
      onCompanyChange?.(companyId);
    }
  }, [open, team, companyOptions, form, onCompanyChange]);

  const handleSubmit = useCallback(
    async values => {
      if (!values?.teamId) {
        toast.error("Couldn't find the team to update");
        return;
      }
      try {
        const payload = {
          _id: values.teamId,
          title: values.teamName?.trim() ?? '',
          companyId: values.companyId ?? '',
          isSponsorsActive: !!values.isSponsorsActive,
          isWhitelabelingEnabled: !!values.isWhitelabelingEnabled,
          isAgentVisualizationEnabled: !!values.isBrandSyncEnabled,
        };

        if (payload.isWhitelabelingEnabled) {
          payload.dashboardURL = values.dashboardURL?.trim()
            ? `${values.dashboardURL.trim()}.bridged.media`
            : '';
          payload.primaryColor = values.primaryColor ?? '';
          payload.logo = values.logoUrl?.trim() ?? '';
        } else {
          payload.dashboardURL = '';
          payload.primaryColor = '';
          payload.logo = '';
        }

        if (payload.isAgentVisualizationEnabled) {
          payload.agentVisualizationConfig = {
            primaryColor: values.brandSyncPrimaryColor ?? '',
            accentColour: values.brandSyncAccentColour ?? '',
            logo: values.brandSyncLogo?.trim() ?? '',
            theme: values.brandSyncTheme ?? 'light',
            fontName: values.brandSyncFontName?.trim() ?? '',
            baseFontScale: values.brandSyncBaseFontScale ?? null,
            borderRadius: values.brandSyncBorderRadius?.trim() ?? '',
          };
        } else {
          payload.agentVisualizationConfig = {
            primaryColor: '',
            accentColour: '',
            logo: '',
            theme: 'light',
            fontName: '',
            baseFontScale: null,
            borderRadius: '',
          };
        }

        const response = await updateTeam(payload).unwrap();
        if (response?.success) {
          toast.success('Team updated');
          await refetchTeamMembers?.();
          closeEditDrawer();
          onSuccess?.();
        } else {
          toast.error(response?.data?.errorObject?.userErrorText || "Couldn't update the team");
        }
      } catch (err) {
        console.log(err);
        toast.error(err?.data?.errorObject?.userErrorText || "Couldn't update the team");
      }
    },
    [updateTeam, onSuccess, refetchTeamMembers, closeEditDrawer]
  );

  const handleFinish = useCallback(
    values => {
      handleSubmit({ ...values, teamId: team?._id });
    },
    [handleSubmit, team]
  );

  const handleClose = useCallback(() => {
    closeEditDrawer();
  }, [closeEditDrawer]);

  const handleAfterOpenChange = useCallback(
    isOpen => {
      if (!isOpen) {
        form.resetFields();
        setCompanySearchText('');
      }
    },
    [form]
  );

  const handleCompanySearch = useCallback(value => {
    setCompanySearchText(value ?? '');
  }, []);

  const createCompany = useCallback(
    async values => {
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
    },
    [createCompanyMutation, refetchCompanies]
  );

  const memberTableData = useMemo(
    () =>
      [...members]
        .map((m, index) => ({
          key: m._id || m.userId || index,
          _id: m.userId || m._id,
          membershipId: m._id,
          userId: m.userId,
          name: m.name?.trim() || m.email || '—',
          email: m.email || '—',
          role: m.isOwner ? 'Owner' : 'Member',
          profilePicture: m.profilePicture,
          status: m.status,
        }))
        .sort((a, b) => {
          if (a.role === 'Owner' && b.role !== 'Owner') return -1;
          if (a.role !== 'Owner' && b.role === 'Owner') return 1;
          return 0;
        }),
    [members]
  );

  const handleMenuClick = useCallback(
    async (key, record) => {
      if (!record?._id) return;

      const tokens = await handleGenerateUserTokenForLogin({ _id: record._id }, key);
      if (!tokens?.accessToken) return;

      if (key === 'portal') {
        openUserPortal(tokens.accessToken, tokens.refreshToken);
      } else if (key === 'plugin') {
        const handlePluginStatus = event => {
          if (event.source !== window) return;
          const eventSource = event.data?.source;
          const eventType = event.data?.payload?.type;
          if (eventSource !== 'qweek-website' || eventType !== 'LOGIN_STATUS') return;

          window.removeEventListener('message', handlePluginStatus);

          if (event.data?.payload?.status === 'success') {
            toast.success('Signed in to the plugin');
            return;
          }

          toast.error("Couldn't sign in to the plugin", {
            description: 'Try again.',
          });
        };

        window.addEventListener('message', handlePluginStatus);
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
      }
    },
    [handleGenerateUserTokenForLogin]
  );

  const handleUpdateUserStatus = useCallback(
    async (userId, action) => {
      try {
        if (action === 'activate') {
          const response = await activateUser(userId).unwrap();
          if (response?.success) {
            toast.success('User activated');
            refetchTeamMembers?.();
          }
          return;
        }

        const response = await deactivateUser(userId).unwrap();
        if (response?.success) {
          toast.success('User deactivated');
          refetchTeamMembers?.();
        }
      } catch (err) {
        toast.error(err?.data?.errorObject?.userErrorText || "Couldn't update the user's status");
      }
    },
    [activateUser, deactivateUser, refetchTeamMembers]
  );

  const handleDeleteMember = useCallback(
    async record => {
      if (!record?.membershipId) {
        toast.error("Couldn't find this member");
        return;
      }
      setDeletingId(record.membershipId);
      try {
        const response = await deleteTeamMember(record.membershipId).unwrap();
        if (response?.success) {
          toast.success('Member removed');
          await refetchTeamMembers?.();
          refetchTeams?.();
        } else {
          toast.error(response?.errorObject?.userErrorText || "Couldn't remove the member");
        }
      } catch (err) {
        toast.error(err?.data?.errorObject?.userErrorText || "Couldn't remove the member");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteTeamMember, refetchTeamMembers, refetchTeams]
  );

  return {
    editTeamDrawerOpen,
    selectedTeamForEdit,
    openEditDrawer,
    closeEditDrawer,
    form,
    companyOptions,
    members,
    isLoadingMembers,
    refetchTeamMembers,
    handleFinish,
    handleClose,
    handleAfterOpenChange,
    memberTableData,
    isSubmitting,
    isLoadingCompanies,
    companySearchText,
    handleCompanySearch,
    createCompany,
    isCreatingCompany,
    // Member row actions (the drawer renders the menu; confirmations happen there).
    handleMenuClick,
    handleUpdateUserStatus,
    handleDeleteMember,
    deletingId,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
  };
};
