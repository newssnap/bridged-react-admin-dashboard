import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../presentation/authentication/reusable/components/Sidebar';
import { getValidOAuthRedirectFromSearch } from '../utils/controllers/oauthRedirect';

function AuthenticationLayout({ children, Sidebarcontent }) {
  const isAuth = useSelector(state => state.auth.data.isAuth);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to the home page if the user is authenticated
  useEffect(() => {
    if (isAuth) {
      const oauthRedirect = getValidOAuthRedirectFromSearch(location.search);
      if (oauthRedirect) {
        navigate(`/accounts?oauth_redirect=${encodeURIComponent(oauthRedirect)}`, { replace: true });
        return;
      }
      navigate('/', { replace: true });
    }
  }, [isAuth, navigate, location.search]);

  return (
    // Phones: a brand band on top and the form in a sheet. From lg: split screen.
    <div className="flex min-h-svh flex-col bg-primary lg:h-svh lg:flex-row lg:bg-background">
      <div className="shrink-0 lg:w-1/2 lg:p-2">
        <Sidebar Sidebarcontent={Sidebarcontent} />
      </div>

      <div className="-mt-6 flex flex-1 flex-col rounded-t-xl bg-background lg:mt-0 lg:w-1/2 lg:overflow-y-auto lg:rounded-none">
        <div className="flex w-full flex-1 items-center justify-center px-6 py-10 sm:px-8 lg:py-12 [&>form]:w-full [&>form]:max-w-sm motion-safe:[&>form]:animate-in motion-safe:[&>form]:fade-in motion-safe:[&>form]:slide-in-from-bottom-1 motion-safe:[&>form]:duration-700 motion-safe:[&>form]:ease-out-expo motion-safe:[&>form]:fill-mode-both">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthenticationLayout;
