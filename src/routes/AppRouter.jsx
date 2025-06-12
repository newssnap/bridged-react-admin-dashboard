import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { Row, Spin } from 'antd';

// Use React.lazy() to lazily load the components
const LazyNotFound = lazy(() => import('../pages/NotFound'));
const LazyLogin = lazy(() => import('../pages/authentication/Login'));
const LazyDashboard = lazy(() => import('../pages/Dashboard'));

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
    <Row style={{ height: '100vh', width: '100%' }} justify="center" align="middle">
      <Spin size="large" />
    </Row>
  );

  const routes = [
    { path: '/login', component: LazyLogin, isProtected: false },
    {
      path: '/',
      component: LazyDashboard,
      isProtected: true,
    },
  ];

  return (
    <Router>
      <Routes>
        {routes.map(({ path, component, isProtected }) => (
          <Route
            key={path}
            path={path}
            element={handlePageTypeAndLayout(component, isProtected)}
          />
        ))}
        <Route key="*" path="*" element={handlePageTypeAndLayout(LazyNotFound, true)} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
