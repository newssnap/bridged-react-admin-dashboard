import React, { useEffect } from 'react';
import DashboardWorkflow from '../presentation/dashboard/workflows/DashboardWorkflow';
import { useLocation } from 'react-router-dom';

function Dashboard() {
  const { search, pathname } = useLocation();
  const queryAccessToken = new URLSearchParams(search).get('accessToken');

  useEffect(() => {
    if (queryAccessToken) {
      localStorage.setItem('accessToken', queryAccessToken);
      const params = new URLSearchParams(search);
      params.delete('accessToken');
      window.history.replaceState({}, document.title, pathname + params.toString());
      window.location.reload();
    }
  }, [queryAccessToken, search, pathname]);

  return <DashboardWorkflow />;
}

export default Dashboard;
