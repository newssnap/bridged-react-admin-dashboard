import { useState, useMemo, useEffect } from 'react';
import { message } from 'antd';
import {
  useGetCompaniesQuery,
  useGetUserAdminPaginationMutation,
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

  const { data: companiesResponse } = useGetCompaniesQuery(
    { page: 1, limit: 500 },
    { skip: !isDrawerOpen }
  );

  const [findAllUsersPagination, { data: usersResponse, isLoading: isUsersLoading }] =
    useGetUserAdminPaginationMutation();

  const [createTeam, { isLoading: isSubmitting }] = useCreateTeamMutation();

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
  };

  const onCompanyChange = () => {
    // No longer loads users by company; kept for form clearing in drawers
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

      await createTeam(payload).unwrap();
      message.success('Team created successfully');
      closeDrawer();
    } catch (err) {
      message.error(err?.data?.message || 'Failed to create team');
    }
  };

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    companyOptions,
    userOptions,
    isUsersLoading,
    onCompanyChange,
    handleSubmit,
    isSubmitting,
  };
};
