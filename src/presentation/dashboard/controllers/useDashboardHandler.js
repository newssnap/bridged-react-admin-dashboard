import { toast } from 'sonner';
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
        toast.success('User added');
        handleCloseDrawer();
      } else {
        toast.error(response?.errorObject?.userErrorText || "Couldn't add the user");
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't add the user");
    }
  };

  const handleGenerateUserTokenForLogin = async (data, key) => {
    setTokenType(key);
    setGenerateTokenIDLogin(data._id);
    try {
      const response = await generateUserToken(data).unwrap();
      if (response.success) {
        return {
          accessToken: response.data.jwtToken,
          refreshToken: response.data.refreshToken,
        };
      } else {
        toast.error(response?.errorObject?.userErrorText || "Couldn't sign in as this user");
        setGenerateTokenIDLogin(null);
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't sign in as this user");
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
