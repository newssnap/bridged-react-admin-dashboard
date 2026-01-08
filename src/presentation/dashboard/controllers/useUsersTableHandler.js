import { useEffect, useState, useMemo } from 'react';
import { notification } from 'antd';
import {
  useGetUserAdminPaginationMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../../services/api';

const PAGE_SIZE = 10;

const useUsersTableHandler = (searchValue, companyId, status, sort) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  const [_GET_USERS, { data: response, isLoading, isError, error }] =
    useGetUserAdminPaginationMutation();

  const [_ACTIVATE_USER, { isLoading: isActivatingUser, error: activateError }] =
    useActivateUserMutation();

  const [_DEACTIVATE_USER, { isLoading: isDeactivatingUser, error: deactivateError }] =
    useDeactivateUserMutation();

  const handleUpdateUserStatus = async (userId, status) => {
    if (status === 'activate') {
      const response = await _ACTIVATE_USER(userId).unwrap();
      if (response?.success) {
        notification.success({
          message: 'User activated successfully',
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    } else {
      const response = await _DEACTIVATE_USER(userId).unwrap();
      if (response?.success) {
        notification.success({
          message: 'User deactivated successfully',
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    }
  };

  useEffect(() => {
    if (deactivateError || activateError) {
      notification.error({
        message:
          deactivateError?.data?.errorObject?.userErrorText ||
          activateError?.data?.errorObject?.userErrorText,
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  }, [deactivateError, activateError]);

  useEffect(() => {
    _GET_USERS({
      companyId: companyId === 'all' ? undefined : companyId,
      status: status === 'all' ? undefined : status,
      sort: sort === 'lastLogin_ASC' ? 'lastLogin_ASC' : 'lastLogin_DESC',
      search: searchValue || '',
      pageNumber: page,
      limit,
    });
  }, [_GET_USERS, page, limit, searchValue, companyId, status, sort]);

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
  }, [searchValue, sort]);

  useEffect(() => {
    if (isError && error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to fetch users',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  }, [isError, error]);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  return {
    users,
    total,
    page,
    limit,
    handlePageChange,
    isLoading,
    handleUpdateUserStatus,
    isStatusLoading: isActivatingUser || isDeactivatingUser,
  };
};

export default useUsersTableHandler;
