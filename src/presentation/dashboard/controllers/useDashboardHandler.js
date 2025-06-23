import { useFindAllUsersQuery } from '../../../services/api';

export const useDashboardHandler = () => {
  const { data: users, isLoading, error, refetch, isFetching } = useFindAllUsersQuery();

  return {
    users: users?.data || [],
    isLoading,
    error,
    refetch,
    isFetching,
    isSuccess: !isLoading && !error && users,
  };
};
