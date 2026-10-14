import { useLoginMutation } from '../../../../services/api';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthData } from '../../../../redux/slices/auth/authSlice';
import { getValidOAuthRedirectFromSearch } from '../../../../utils/controllers/oauthRedirect';

// Custom hook for handling login functionality
const useLoginHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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

        // Preserve Claude OAuth context only for a real authorize URL
        const oauthRedirect = getValidOAuthRedirectFromSearch(location.search);
        if (oauthRedirect) {
          navigate(`/?oauth_redirect=${encodeURIComponent(oauthRedirect)}`);
        } else {
          navigate('/');
        }
      }

      if (response?.error) {
        // Handle and display the error message if login is unsuccessful
        toast.error(
          response?.error?.data?.errorObject?.userErrorText || "Couldn't log you in"
        );
      }
    } catch (error) {
      toast.error("Couldn't log you in");
    }
  };

  return { isLoading, loginHandler };
};

export default useLoginHandler;
