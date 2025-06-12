import { useDispatch } from "react-redux";
import {
  useAcceptTeamInviteMutation,
  useVerifyUserEmailMutation,
} from "../../../../services/api";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { setAuthData } from "../../../../redux/slices/auth/authSlice";

const useVerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [_VERIFY_EMAIL, { isLoading }] = useVerifyUserEmailMutation();
  const [_ACCEPT_INVITE] = useAcceptTeamInviteMutation();

  const verifyEmailHandler = async (values, teamMemberId) => {
    // Send a request to verify the user's email
    const response = await _VERIFY_EMAIL(values);

    if (response?.data?.success) {
      // Handle success
      const { accessToken, refreshToken, role } = response?.data?.data;

      // Store authentication data in local storage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("isUser", true);

      // Dispatch authentication data to Redux
      dispatch(
        setAuthData({
          isAuth: true,
          accessToken,
          role,
          email: values.email,
        })
      );

      if (teamMemberId) {
        // If there's a team invite, accept it
        await _ACCEPT_INVITE(teamMemberId);
      }

      // Navigate to onboarding page
      navigate("/onboarding");

      // Display a success message
      notification.success({
        message: "Email Verified Successfully",
        placement: "bottomRight",
        showProgress: true,
      });
    } else if (response?.error) {
      // Handle errors, display an error message
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: "bottomRight",
        showProgress: true,
      });
    }
  };

  return { isLoading, verifyEmailHandler };
};

export default useVerifyEmail;
