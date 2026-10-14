import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useGetUserAdminPaginationMutation,
  useSetCompanyUsersMutation,
} from '../../../services/api';
import { toast } from 'sonner';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';

const useManageUsersDrawerHandler = companyId => {
  const [userIds, setUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  // Set when the last users request failed, so the drawer can offer "Try again".
  const [isUsersError, setIsUsersError] = useState(false);
  const hasInitializedSelection = useRef(false);
  const previousCompanyId = useRef(null);
  const userHasManuallyChangedSelection = useRef(false);
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
    fullname: user?.fullname,
    isTeamOwner: user?.isTeamOwner,
    teamId: user?.teamId,
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
        setIsUsersError(false);
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
        // Shown inline in the drawer ("Couldn't load users" + Try again) rather than as a toast.
        setIsUsersError(true);
        setUsers([]);
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
    // Mark that user has manually changed selection
    userHasManuallyChangedSelection.current = true;

    // Get the IDs of all rows on the current page
    const currentPageIds = users.map(user => user?._id).filter(Boolean);

    // Remove all IDs from the current page from the existing selection
    // Then add back the newly selected IDs from the current page
    // This preserves selections from other pages
    setUserIds(prevUserIds => {
      const otherPagesIds = prevUserIds.filter(id => !currentPageIds.includes(id));
      return [...otherPagesIds, ...selectedRowKeys];
    });
  };

  const handleSubmit = async () => {
    if (!companyId) {
      toast.error("Couldn't find this company");
      return;
    }

    try {
      await _SET_COMPANY_USERS({ id: companyId, userIds }).unwrap();
      toast.success('Users updated');
      return true;
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't update the users");
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
  // Only run when companyId changes (not on pagination)
  useEffect(() => {
    // Reset initialization flag when companyId changes
    if (previousCompanyId.current !== companyId) {
      hasInitializedSelection.current = false;
      previousCompanyId.current = companyId;
      userHasManuallyChangedSelection.current = false;
      setUserIds([]);
    }
  }, [companyId]);

  // Reset all local state when drawer closes (companyId cleared) or company changes
  useEffect(() => {
    if (!companyId) {
      hasInitializedSelection.current = false;
      previousCompanyId.current = null;
      userHasManuallyChangedSelection.current = false;

      setUsers([]);
      setIsUsersError(false);
      setUserIds([]);
      setFilters({ status: 'all', sort: 'lastLogin_DESC' });
      setPagination({ pageNumber: 1, limit: 10, total: 0 });
      onSearchChange('');
    }
  }, [companyId, onSearchChange]);

  // Preselect users that match the companyId
  // This runs on initial load and when navigating pages during initialization
  // Stops auto-preselecting after user manually changes selections
  useEffect(() => {
    // Only auto-preselect if user hasn't manually changed selections yet
    if (
      !userHasManuallyChangedSelection.current &&
      Array.isArray(users) &&
      users.length > 0 &&
      companyId
    ) {
      const matchingUserIds = users
        .filter(user => user?.company?._id === companyId)
        .map(user => user?._id)
        .filter(Boolean);

      if (matchingUserIds.length > 0) {
        setUserIds(prevUserIds => {
          // If we haven't initialized yet (first page load), replace with matching users
          if (!hasInitializedSelection.current) {
            hasInitializedSelection.current = true;
            return matchingUserIds;
          }
          // If already initialized, merge matching users from current page
          // This ensures users on other pages are also preselected when we navigate to them
          const mergedIds = [...prevUserIds];
          matchingUserIds.forEach(id => {
            if (!mergedIds.includes(id)) {
              mergedIds.push(id);
            }
          });
          return mergedIds;
        });
      } else if (!hasInitializedSelection.current) {
        // Mark as initialized even if no matching users on this page
        hasInitializedSelection.current = true;
      }
    }
  }, [users, companyId]);

  // Trigger fetch when debounced search updates
  useEffect(() => {
    if (companyId) {
      setPagination(prev => ({ ...prev, pageNumber: 1 }));
      fetchUsers(1, pagination.limit, { search: debouncedSearch });
    }
  }, [companyId, debouncedSearch, fetchUsers, pagination.limit]);

  const rowSelection = {
    selectedRowKeys: userIds,
    onChange: handleRowSelectionChange,
  };

  return {
    users,
    isUsersLoading,
    isUsersError,
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
