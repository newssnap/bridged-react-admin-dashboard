import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import HomeWorkflow from '../presentation/home/workflows/HomeWorkflow';
import useAccessTokenFromUrl from '../utils/controllers/useAccessTokenFromUrl';
import { getValidOAuthRedirectFromSearch } from '../utils/controllers/oauthRedirect';

function Home() {
  const { search } = useLocation();
  useAccessTokenFromUrl();

  // The Connect to Claude flow happens on Accounts; older links still point at "/".
  if (getValidOAuthRedirectFromSearch(search)) {
    return <Navigate to={`/accounts${search}`} replace />;
  }

  return <HomeWorkflow />;
}

export default Home;
