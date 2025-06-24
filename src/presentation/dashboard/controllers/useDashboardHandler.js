import { notification } from 'antd';
import { useFindAllUsersQuery, useAddUserMutation } from '../../../services/api';

export const useDashboardHandler = () => {
  const { data: users, isLoading, error, refetch, isFetching } = useFindAllUsersQuery();
  const [addUser, { isLoading: isAddingUser }] = useAddUserMutation();

  const handleAddUser = async (userData, handleCloseDrawer) => {
    try {
      const response = await addUser(userData).unwrap();
      console.log(response);
      if (response?.success) {
        notification.success({
          message: 'User added successfully',
          placement: 'bottomRight',
        });
        handleCloseDrawer();
      } else {
        notification.error({
          message: response.errorObject.userErrorText
            ? response.errorObject.userErrorText
            : 'Failed to add user',
          placement: 'bottomRight',
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      notification.error({
        message: error.data.errorObject.userErrorText
          ? error.data.errorObject.userErrorText
          : 'Failed to add user',
        placement: 'bottomRight',
      });
    }
  };

  return {
    users: users?.data || [],
    isLoading,
    error,
    refetch,
    isFetching,
    isSuccess: !isLoading && !error && users,
    handleAddUser,
    isAddingUser,
  };
};
