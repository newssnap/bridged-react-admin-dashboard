import { useState } from "react";
import { useResendVerifyEmailCodeMutation } from "../../../../services/api";
import { notification } from "antd";

const useCustomResendVerificationCode = () => {
  const [_RESEND_CODE, { isLoading: resendCodeLoading }] =
    useResendVerifyEmailCodeMutation();
  const [resendCodeBtnText, setResendCodeBtnText] = useState("Resend code");

  const resendCode = async (email) => {
    // Send a request to resend the verification code
    const response = await _RESEND_CODE({ email });

    if (response?.data?.success) {
      // If successful, start a countdown timer for re-enabling the resend button
      const sec = 120;
      let currTime = 1;
      setResendCodeBtnText(`${sec - currTime} seconds`);
      const timer = setInterval(() => {
        setResendCodeBtnText(`${sec - currTime} seconds`);
        currTime++;
      }, 1000);

      // After the specified time, reset the button text and clear the timer
      setTimeout(() => {
        setResendCodeBtnText("Resend code");
        clearInterval(timer);
      }, 1000 * sec);

      // Display a success message

      notification.success({
        message: "Please check your email to check the new verification code",
        placement: "bottomRight",
        showProgress: true,
      });
    }

    if (response?.error) {
      // Display an error message if there's an issue
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: "bottomRight",
        showProgress: true,
      });
    }
  };

  return { resendCodeLoading, resendCodeBtnText, resendCode };
};

export default useCustomResendVerificationCode;
