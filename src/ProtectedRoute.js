import { Navigate, useLocation } from 'react-router-dom';
import AuthPageLayout from './layouts/AuthPageLayout';
import { useSelector } from 'react-redux';
import NonAuthPageLayout from './layouts/NonAuthPageLayout';

function ProtectedRoute({ children, isProtected, HeaderComp }) {
  // Check if the user is authenticated by getting the state from Redux
  const isAuth = useSelector(state => state.auth.data.isAuth);
  const location = useLocation();

  // If the route is protected and the user is not authenticated, navigate to the login page
  if (isProtected && !isAuth) {
    const searchParams = new URLSearchParams(location.search);
    const oauthRedirect = searchParams.get('oauth_redirect');
    const redirectQuery = oauthRedirect
      ? `oauth_redirect=${encodeURIComponent(oauthRedirect)}`
      : `oauth_redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`;
    return <Navigate to={`/login?${redirectQuery}`} replace />;
  }

  // If the route is protected, wrap the children in the AuthPageLayout
  if (isProtected) {
    return <AuthPageLayout HeaderComp={HeaderComp}>{children}</AuthPageLayout>;
  }

  // If the route is not protected, wrap the children in the NonAuthPageLayout
  return <NonAuthPageLayout>{children}</NonAuthPageLayout>;
}

export default ProtectedRoute;
