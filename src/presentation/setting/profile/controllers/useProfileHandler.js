import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUserInfoQuery } from '../../../../services/api';
import { setUserData } from '../../../../redux/slices/user/profileSlice';

const useProfileHandler = () => {
  const dispatch = useDispatch();
  // const { data, isLoading, isSuccess } = useUserInfoQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUserData(data?.data));
    }
  }, [isSuccess, data]);

  return {
    isLoading,
  };
};

export default useProfileHandler;
