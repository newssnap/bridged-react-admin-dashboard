import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { setAuthData } from "../../../../redux/slices/auth/authSlice";
import { useFacebookAuthenticationQuery } from "../../../../services/api";

const useFacebookLoginHandler = () => {
  const [accessToken, setAccessToken] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user data with the Facebook access token
  const { data, isSuccess, isLoading } = useFacebookAuthenticationQuery(
    accessToken ? accessToken : skipToken
  );

  useEffect(() => {
    // Handle Facebook token response
    const facebookTokenHandler = () => {
      if (isSuccess) {
        const { accessToken, refreshToken, role } = data?.data;

        // Store access token and refresh token in local storage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

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
    facebookTokenHandler();
  }, [isSuccess, data]);

  return { isLoading, setAccessToken };
};

export default useFacebookLoginHandler;
