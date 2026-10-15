import React from 'react';
import DashboardWorkflow from '../presentation/dashboard/workflows/DashboardWorkflow';
import useAccessTokenFromUrl from '../utils/controllers/useAccessTokenFromUrl';

function Dashboard() {
  useAccessTokenFromUrl();
  return <DashboardWorkflow />;
}

export default Dashboard;
