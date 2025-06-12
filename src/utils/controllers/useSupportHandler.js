import { notification } from "antd";
import { useFeedbackMutation, useSupportMutation } from "../../services/api";

// Custom hook for handling Support functionality
const useSupportHandler = () => {
  const [_FEEDBACK, { isLoading: feedbackLoading }] = useFeedbackMutation();
  const [_SUPPORT, { isLoading: supportLoading }] = useSupportMutation();

  // Function to handle the feedback process
  const feedbackHandler = async (values, setIsDrawerOpen) => {
    try {
      const response = await _FEEDBACK(values);

      if (response?.data?.success) {
        notification.success({
          message: "Thank you for your feedback",
          placement: "bottomRight",
          showProgress: true,
        });
      }

      if (response?.error) {
        // Handle and display the error message if unsuccessful
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: "bottomRight",
          showProgress: true,
        });
      }
      setIsDrawerOpen(false);
    } catch (error) {
      // Handle unexpected errors and log them
      console.error("feedback error:", error);
    }
  };

  // Function to handle the feedback process
  const supportHandler = async (values, setIsDrawerOpen) => {
    try {
      const response = await _SUPPORT(values);

      if (response?.data?.success) {
        notification.success({
          message: "Our Support Team will get back to you soon",
          placement: "bottomRight",
          showProgress: true,
        });
      }

      if (response?.error) {
        // Handle and display the error message if unsuccessful
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: "bottomRight",
          showProgress: true,
        });
      }
      setIsDrawerOpen(false);
    } catch (error) {
      // Handle unexpected errors and log them
      console.error("support error:", error);
    }
  };

  return {
    isLoading: feedbackLoading || supportLoading,
    feedbackHandler,
    supportHandler,
  };
};

export default useSupportHandler;
