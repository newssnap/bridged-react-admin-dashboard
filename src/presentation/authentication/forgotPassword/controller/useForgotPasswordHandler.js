import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import {
  useForgotPasswordMutation,
  useForgotPasswordVerificationMutation,
} from "../../../../services/api";

const useForgotPasswordHandler = () => {
  const navigate = useNavigate();

  // Mutation for verifying the email and sending a verification code
  const [
    _VERIFY_EMAIL,
    { isLoading: verifyEmailIsLoading, isSuccess: verifyEmailIsSuccess },
  ] = useForgotPasswordVerificationMutation();

  // Mutation for resetting the password
  const [_FORGOT_PASSWORD, { isLoading: forgotPasswordIsLoading }] =
    useForgotPasswordMutation();

  // Function to send a verification code to the user's email
  const sendVerificationCode = async (values) => {
    try {
      const response = await _VERIFY_EMAIL(values);

      if (response?.data?.success) {
        notification.success({
          message: "A five-digit verification code has been sent.",
          placement: "bottomRight",
          showProgress: true,
        });
      } else if (response?.error) {
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: "bottomRight",
          showProgress: true,
        });
      }
    } catch (error) {
      console.error("Error sending verification code: ", error);
    }
  };

  // Function to reset the user's password
  const resetPasswordHandler = async (values, email) => {
    try {
      const response = await _FORGOT_PASSWORD({ ...values, email: email });

      if (response?.data?.success) {
        notification.success({
          message: "Password changed successfully.",
          placement: "bottomRight",
          showProgress: true,
        });
        navigate("/login");
      } else if (response?.error) {
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: "bottomRight",
          showProgress: true,
        });
      }
    } catch (error) {
      console.error("Error resetting password: ", error);
    }
  };

  return {
    verifyEmailIsLoading,
    verifyEmailIsSuccess,
    sendVerificationCode,
    forgotPasswordIsLoading,
    resetPasswordHandler,
  };
};

export default useForgotPasswordHandler;
