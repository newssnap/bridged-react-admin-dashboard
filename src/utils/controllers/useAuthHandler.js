import { useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useDispatch } from "react-redux";
import {
  setAuthAccessToken,
  setAuthData,
  setIsAuth,
} from "../../redux/slices/auth/authSlice";

const useAuthHandler = () => {
  const dispatch = useDispatch();
  // Check if the user is authenticated
  useEffect(() => {
    const isAuthenticated = () => {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken && accessToken !== "undefined") {
        // Decode the JWT to get user data
        const decodedJwt = jwt_decode(accessToken);
        dispatch(
          setAuthData({
            isAuth: true,
            accessToken,
            role: decodedJwt?.role,
            email: decodedJwt?.username,
          })
        );
      } else {
        // User is not authenticated, update Redux state
        dispatch(setIsAuth(false));
        dispatch(setAuthAccessToken(""));
      }
    };

    isAuthenticated();
  }, [dispatch]);
};

export default useAuthHandler;
