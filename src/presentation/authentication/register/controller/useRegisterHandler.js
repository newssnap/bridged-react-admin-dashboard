import { useSignUpMutation } from "../../../../services/api";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

// Custom hook for handling registration (signup) functionality
const useRegisterHandler = () => {
  const navigate = useNavigate();
  const [_SIGNUP, { isLoading }] = useSignUpMutation();

  // Function to handle user registration
  const registerHandler = async (values, teamMemberId) => {
    try {
      const response = await _SIGNUP(values);

      if (response?.data?.success) {
        // Show a success message and navigate to the email confirmation page
        notification.success({
          message: "Please check your email to confirm your account",
          placement: "bottomRight",
          showProgress: true,
        });

        // Create a delay before navigating to allow time for the message to display
        setTimeout(() => {
          if (teamMemberId) {
            navigate(
              `/confirmemail/${response?.data?.data?.email}?teamMemberId=${teamMemberId}`
            );
          } else {
            navigate(`/confirmemail/${response?.data?.data?.email}`);
          }
        }, 500);
      }

      if (response?.error) {
        // Handle and display the error message if registration is unsuccessful
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: "bottomRight",
          showProgress: true,
        });
      }
    } catch (error) {
      // Handle unexpected errors and log them
      console.error("Registration error:", error);
    }
  };

  return { isLoading, registerHandler };
};

export default useRegisterHandler;
