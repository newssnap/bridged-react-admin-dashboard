import { notification } from 'antd';
import { useAddUserMutation, useGenerateUserTokenMutation } from '../../../services/api';
import { useState } from 'react';

export const useDashboardHandler = () => {
  const [addUser, { isLoading: isAddingUser }] = useAddUserMutation();
  const [generateUserToken, { isLoading: isGeneratingTokenForLogin }] =
    useGenerateUserTokenMutation();

  const [generateTokenIDLogin, setGenerateTokenIDLogin] = useState(null);
  const [tokenType, setTokenType] = useState(null);

  const handleAddUser = async (userData, handleCloseDrawer) => {
    try {
      const response = await addUser(userData).unwrap();
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

  const handleGenerateUserTokenForLogin = async (data, key) => {
    setTokenType(key);
    setGenerateTokenIDLogin(data._id);
    try {
      const response = await generateUserToken(data).unwrap();
      if (response.success) {
        return response.data.jwtToken;
      } else {
        notification.error({
          message: response.errorObject.userErrorText
            ? response.errorObject.userErrorText
            : 'Failed to generate user token',
          placement: 'bottomRight',
        });
        setGenerateTokenIDLogin(null);
        return null;
      }
    } catch (error) {
      console.log(error);
      setTokenType(null);
      setGenerateTokenIDLogin(null);
      return null;
    } finally {
      setTokenType(null);
      setGenerateTokenIDLogin(null);
    }
  };

  return {
    handleAddUser,
    isAddingUser,
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
    setTokenType,
  };
};
