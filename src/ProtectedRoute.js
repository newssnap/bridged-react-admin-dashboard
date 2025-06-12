import { Navigate } from "react-router-dom";
import AuthPageLayout from "./layouts/AuthPageLayout";
import { useSelector } from "react-redux";
import NonAuthPageLayout from "./layouts/NonAuthPageLayout";

function ProtectedRoute({ children, isProtected, HeaderComp }) {
  // Check if the user is authenticated by getting the state from Redux
  const isAuth = useSelector((state) => state.auth.data.isAuth);

  // If the route is protected and the user is not authenticated, navigate to the login page
  if (isProtected && !isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If the route is protected, wrap the children in the AuthPageLayout
  if (isProtected) {
    return <AuthPageLayout HeaderComp={HeaderComp}>{children}</AuthPageLayout>;
  }

  // If the route is not protected, wrap the children in the NonAuthPageLayout
  return <NonAuthPageLayout>{children}</NonAuthPageLayout>;
}

export default ProtectedRoute;
