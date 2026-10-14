import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  useGetUserAdminPaginationMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../../services/api';

const PAGE_SIZE = 10;

const useUsersTableHandler = (searchValue, companyId, teamId, status, sort) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  const [_GET_USERS, { data: response, isLoading, isError, error, isUninitialized }] =
    useGetUserAdminPaginationMutation();

  const [_ACTIVATE_USER, { isLoading: isActivatingUser, error: activateError }] =
    useActivateUserMutation();

  const [_DEACTIVATE_USER, { isLoading: isDeactivatingUser, error: deactivateError }] =
    useDeactivateUserMutation();

  // Refetch users function
  const refetchUsers = useCallback(() => {
    _GET_USERS({
      companyId: companyId === 'all' ? undefined : companyId,
      teamId: teamId === 'all' ? undefined : teamId,
      status: status === 'all' ? undefined : status,
      sort: sort === 'lastLogin_ASC' ? 'lastLogin_ASC' : 'lastLogin_DESC',
      search: searchValue || '',
      pageNumber: page,
      limit,
    });
  }, [_GET_USERS, companyId, teamId, status, sort, searchValue, page, limit]);

  const handleUpdateUserStatus = async (userId, status) => {
    if (status === 'activate') {
      const response = await _ACTIVATE_USER(userId).unwrap();
      if (response?.success) {
        toast.success('User activated');
        // Refetch users to update the status in UI
        refetchUsers();
      }
    } else {
      const response = await _DEACTIVATE_USER(userId).unwrap();
      if (response?.success) {
        toast.success('User deactivated');
        // Refetch users to update the status in UI
        refetchUsers();
      }
    }
  };

  useEffect(() => {
    if (deactivateError || activateError) {
      toast.error(
        deactivateError?.data?.errorObject?.userErrorText ||
          activateError?.data?.errorObject?.userErrorText ||
          "Couldn't update the user's status"
      );
    }
  }, [deactivateError, activateError]);

  useEffect(() => {
    _GET_USERS({
      companyId: companyId === 'all' ? undefined : companyId,
      teamId: teamId === 'all' ? undefined : teamId,
      status: status === 'all' ? undefined : status,
      sort: sort === 'lastLogin_ASC' ? 'lastLogin_ASC' : 'lastLogin_DESC',
      search: searchValue || '',
      pageNumber: page,
      limit,
    });
  }, [_GET_USERS, page, limit, searchValue, companyId, teamId, status, sort]);

  const { users, total } = useMemo(() => {
    const usersData =
      response?.data?.data ?? response?.data ?? (Array.isArray(response) ? response : []);

    return {
      users: Array.isArray(usersData) ? usersData : [],
      total:
        response?.total ??
        response?.totalLength ??
        response?.data?.total ??
        response?.data?.totalLength ??
        usersData.length ??
        0,
    };
  }, [response]);

  useEffect(() => {
    setPage(1);
  }, [searchValue, sort, companyId, teamId]);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  return {
    // table data
    users,
    total,
    page,
    limit,
    // table controls
    handlePageChange,
    refetchUsers,
    // loading and actions (the first request goes out after mount: count that as loading too)
    isLoading: isLoading || isUninitialized,
    // A failed load shows the table's "Couldn't load users" state (with Try again).
    isError,
    loadError: error,
    handleUpdateUserStatus,
    isStatusLoading: isActivatingUser || isDeactivatingUser,
  };
};

export default useUsersTableHandler;
