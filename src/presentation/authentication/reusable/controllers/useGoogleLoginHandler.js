import { useGoogleAuthenticationQuery } from "../../../../services/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { setAuthData } from "../../../../redux/slices/auth/authSlice";
import { notification } from "antd";

const useGoogleLoginHandler = () => {
  const [accessToken, setAccessToken] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user data with the Google access token
  const { isLoading, data, isSuccess, isError } = useGoogleAuthenticationQuery(
    accessToken ? accessToken : skipToken
  );

  useEffect(() => {
    // Handle Google token response
    const googleTokenHandler = () => {
      if (isSuccess) {
        const { accessToken, refreshToken, role } = data?.data;

        // Store access token, refresh token, and user status in local storage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("isUser", true);

        // Dispatch authentication data to Redux
        dispatch(
          setAuthData({
            isAuth: true,
            accessToken,
            role,
          })
        );

        // Navigate to the home page
        navigate("/");

        // Display a success message
        notification.success({
          message: "Login Successful",
          placement: "bottomRight",
          showProgress: true,
        });
      }
    };
    googleTokenHandler();
  }, [isSuccess, data, isError]);

  // Handler for initiating Google login
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (response) => {
      setAccessToken(response.access_token);
    },
  });

  return { isLoading, googleLoginHandler };
};

export default useGoogleLoginHandler;
