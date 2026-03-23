import { useState, useMemo, useEffect } from 'react';
import { message, notification } from 'antd';
import {
  useGetCompaniesQuery,
  useGetUserAdminPaginationMutation,
  useCreateCompanyMutation,
  useCreateTeamMutation,
} from '../../../services/api';

const DEFAULT_PAGINATION = {
  pageNumber: 1,
  limit: 500,
  status: 'all',
  sort: 'lastLogin_DESC',
  search: '',
};

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

  const [findAllUsersPagination, { data: usersResponse, isLoading: isUsersLoading }] =
    useGetUserAdminPaginationMutation();

  const [createTeam, { isLoading: isSubmitting }] = useCreateTeamMutation();
  const [createCompanyMutation, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();

  const companiesList = companiesResponse?.data?.data ?? [];
  const companyOptions = useMemo(
    () => companiesList.map(c => ({ value: c.id, label: c.name || '--' })),
    [companiesList]
  );

  const usersList = usersResponse?.data?.data ?? [];
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

  const isAnyTeamDrawerOpen = isDrawerOpen || isEditTeamDrawerOpen;

  useEffect(() => {
    if (isAnyTeamDrawerOpen) {
      findAllUsersPagination({
        ...DEFAULT_PAGINATION,
      });
    }
  }, [isAnyTeamDrawerOpen]);

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
      notification.success({
        message: 'Company created successfully',
        placement: 'bottomRight',
      });

      await refetchCompanies();
      setCompanySearchText('');

      return result?.id || result?.data?.id || result?.data?.data?.id || result?._id || null;
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to create company',
        placement: 'bottomRight',
      });
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
        teamMembers,
      };

      if (payload.isWhitelabelingEnabled) {
        payload.dashboardURL = values.dashboardURL?.trim() ?? '';
        payload.primaryColor = values.primaryColor ?? '';
        payload.logo = values.logoUrl?.trim() ?? '';
      }

      const response = await createTeam(payload).unwrap();
      if (response?.success) {
        notification.success({
          message: 'Team added successfully',
          placement: 'bottomRight',
        });
        closeDrawer();
      } else {
        notification.error({
          message: response?.data?.errorObject?.userErrorText || 'Failed to update team credits',
          placement: 'bottomRight',
        });
      }
    } catch (err) {
      console.log(err);
      notification.error({
        message: err?.data?.errorObject?.userErrorText || 'Something went wrong',
        placement: 'bottomRight',
      });
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
