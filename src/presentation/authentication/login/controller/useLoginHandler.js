import { useLoginMutation } from '../../../../services/api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { setAuthData } from '../../../../redux/slices/auth/authSlice';

// Custom hook for handling login functionality
const useLoginHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [_LOGIN, { isLoading }] = useLoginMutation();

  // Function to handle the login process
  const loginHandler = async values => {
    try {
      const response = await _LOGIN(values);

      if (response?.data?.success) {
        const { accessToken, fullname } = response?.data?.data;

        // Email is verified, set tokens and user data in local storage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('fullname', fullname);

        // Dispatch user authentication data to Redux
        dispatch(
          setAuthData({
            isAuth: true,
            accessToken,
            fullname,
          })
        );

        // Navigate to the main page and show a success message
        navigate('/');
        notification.success({
          message: 'Login Successful',
          placement: 'bottomRight',
          showProgress: true,
        });
      }

      if (response?.error) {
        // Handle and display the error message if login is unsuccessful
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    } catch (error) {
      // Handle unexpected errors and log them
      console.error('Login error:', error);
    }
  };

  return { isLoading, loginHandler };
};

export default useLoginHandler;
