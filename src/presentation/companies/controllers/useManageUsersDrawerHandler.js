import { useState, useEffect, useCallback } from 'react';
import {
  useGetUserAdminPaginationMutation,
  useSetCompanyUsersMutation,
} from '../../../services/api';
import { notification } from 'antd';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';

const useManageUsersDrawerHandler = companyId => {
  const [userIds, setUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    sort: 'lastLogin_DESC',
  });
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    limit: 10,
    total: 0,
  });
  const [_GET_USERS, { isLoading: isUsersLoading }] = useGetUserAdminPaginationMutation();
  const [_SET_COMPANY_USERS, { isLoading: isSubmitting }] = useSetCompanyUsersMutation();
  const {
    inputQuery: searchValue,
    debouncedValue: debouncedSearch,
    inputHandler: onSearchChange,
  } = useDebouncedInput('');

  const dataSource = users.map(user => ({
    key: user?._id,
    _id: user?._id,
    email: user?.email,
    status: user?.status,
    company: user?.company,
  }));

  // Fetch users with pagination
  const fetchUsers = useCallback(
    async (pageNum = 1, pageLimit = pagination.limit, overrideFilters = {}) => {
      const nextStatus = overrideFilters.status ?? filters.status;
      const nextSort = overrideFilters.sort ?? filters.sort;
      const nextSearch = overrideFilters.search ?? debouncedSearch;

      try {
        const response = await _GET_USERS({
          status: nextStatus,
          sort: nextSort,
          search: nextSearch,
          pageNumber: pageNum,
          limit: pageLimit,
          companyId: '',
        }).unwrap();

        const usersData = response?.data?.data || response?.data || [];
        setUsers(usersData);

        // Update pagination if total is provided
        if (response?.data?.totalLength !== undefined) {
          setPagination(prev => ({
            ...prev,
            pageNumber: pageNum,
            limit: pageLimit,
            total: response.data.totalLength,
          }));
        }
      } catch (error) {
        notification.error({
          message: 'Failed to fetch users',
          placement: 'bottomRight',
        });
        setUsers([]);
      } finally {
      }
    },
    [_GET_USERS, debouncedSearch, filters.sort, filters.status, pagination.limit]
  );

  const handleStatusChange = value => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
    fetchUsers(1, pagination.limit, { status: value });
  };

  const handleSortChange = value => {
    setFilters(prev => ({ ...prev, sort: value }));
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
    fetchUsers(1, pagination.limit, { sort: value });
  };

  const handleRowSelectionChange = selectedRowKeys => {
    setUserIds(selectedRowKeys);
  };

  const handleSubmit = async () => {
    if (!companyId) {
      notification.error({
        message: 'Company ID is required',
        placement: 'bottomRight',
      });
      return;
    }

    try {
      await _SET_COMPANY_USERS({ id: companyId, userIds }).unwrap();
      notification.success({
        message: 'Users updated successfully',
        placement: 'bottomRight',
      });
      return true;
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to update users',
        placement: 'bottomRight',
      });
      return false;
    }
  };

  // Fetch users when component mounts or companyId changes
  useEffect(() => {
    if (companyId) {
      fetchUsers(1, 10);
    }
  }, [companyId, fetchUsers]);

  // Initialize selected userIds based on companyId match
  useEffect(() => {
    if (Array.isArray(users) && users.length > 0 && companyId) {
      const initialSelectedIds = users
        .filter(user => user?.company?._id === companyId)
        .map(user => user?._id)
        .filter(Boolean);

      setUserIds(initialSelectedIds);
    } else {
      setUserIds([]);
    }
  }, [users, companyId]);

  // Trigger fetch when debounced search updates
  useEffect(() => {
    if (companyId) {
      setPagination(prev => ({ ...prev, pageNumber: 1 }));
      fetchUsers(1, pagination.limit, { search: debouncedSearch });
    }
  }, [companyId, debouncedSearch, fetchUsers, pagination.limit]);

  const columns = [
    {
      title: 'User Email',
      dataIndex: 'email',
      key: 'email',
      render: email => <span style={{ fontSize: '14px' }}>{email || '--'}</span>,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 200,
      render: fullname => <span style={{ fontSize: '14px' }}>{fullname || '--'}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 200,
      render: role => <span style={{ fontSize: '14px' }}>{role || '--'}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: 200,
      render: company => <span style={{ fontSize: '14px' }}>{company?.name || '--'}</span>,
    },
  ];

  const rowSelection = {
    selectedRowKeys: userIds,
    onChange: handleRowSelectionChange,
  };

  return {
    users,
    isUsersLoading,
    columns,
    dataSource,
    userIds,
    rowSelection,
    handleSubmit,
    isSubmitting,
    pagination,
    fetchUsers,
    filters,
    searchValue,
    onSearchChange,
    handleStatusChange,
    handleSortChange,
  };
};

export default useManageUsersDrawerHandler;
