import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { Spinner } from '@/components/ui/spinner';

// Use React.lazy() to lazily load the components
const LazyNotFound = lazy(() => import('../pages/NotFound'));
const LazyLogin = lazy(() => import('../pages/authentication/Login'));
const LazyHome = lazy(() => import('../pages/Home'));
const LazyDashboard = lazy(() => import('../pages/Dashboard'));
const LazyDefaultChecklist = lazy(() => import('../pages/DefaultChecklist'));
const LazyUserChecklist = lazy(() => import('../pages/UserChecklist'));
const LazyCompanies = lazy(() => import('../pages/Companies'));
const LazyTeams = lazy(() => import('../pages/Teams'));
const LazyTeamCredits = lazy(() => import('../pages/TeamCredits'));
const LazyCustomWork = lazy(() => import('../pages/CustomWork'));
const LazyAgentReports = lazy(() => import('../pages/AgentReports'));
function AppRouter() {
  // Function to handle page type and layout
  const handlePageTypeAndLayout = (Children, isProtected) => {
    return (
      <ProtectedRoute isProtected={isProtected}>
        <Suspense fallback={fallback}>
          <Children />
        </Suspense>
      </ProtectedRoute>
    );
  };

  const fallback = (
    <div className="flex min-h-[60vh] w-full items-center justify-center" role="status">
      <Spinner className="size-6 text-muted-foreground" />
      <span className="sr-only">Loading</span>
    </div>
  );

  const routes = [
    { path: '/login', component: LazyLogin, isProtected: false },
    {
      path: '/',
      component: LazyHome,
      isProtected: true,
    },
    {
      path: '/accounts',
      component: LazyDashboard,
      isProtected: true,
    },
    {
      path: '/companies',
      component: LazyCompanies,
      isProtected: true,
    },
    {
      path: '/defaultChecklist',
      component: LazyDefaultChecklist,
      isProtected: true,
    },
    {
      path: '/userChecklist/:id',
      component: LazyUserChecklist,
      isProtected: true,
    },
    {
      path: '/teams',
      component: LazyTeams,
      isProtected: true,
    },
    {
      path: '/teams/credits',
      component: LazyTeamCredits,
      isProtected: true,
    },
    {
      path: '/teams/custom-work',
      component: LazyCustomWork,
      isProtected: true,
    },
    {
      path: '/reports',
      component: LazyAgentReports,
      isProtected: true,
    },
  ];

  return (
    <Router>
      <Routes>
        {routes.map(({ path, component, isProtected }) => (
          <Route key={path} path={path} element={handlePageTypeAndLayout(component, isProtected)} />
        ))}
        <Route key="*" path="*" element={handlePageTypeAndLayout(LazyNotFound, true)} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
