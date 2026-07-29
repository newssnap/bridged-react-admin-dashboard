import React, { useEffect, useMemo, useState } from 'react';
import { Affix, Col, Layout, Row, theme } from 'antd';
import useGetWindowWidth from '../utils/controllers/useGetWindowWidth';
import GlobalSidebar from './GlobalSidebar';
// import SchedulingForm from '../utils/components/SchedulingForm';
import { useLocation } from 'react-router-dom';
import { getValidOAuthRedirectFromSearch } from '../utils/controllers/oauthRedirect';

const { Content, Sider, Header } = Layout;

function AuthPageLayout({ children, HeaderComp }) {
  const location = useLocation();

  // Custom hook to get window width
  const width = useGetWindowWidth();

  // Hide sidebar only during a real Claude OAuth connect flow
  const isClaudeOAuthFlow = useMemo(
    () => Boolean(getValidOAuthRedirectFromSearch(location.search)),
    [location.search]
  );

  // State to manage the width of the main content
  const [mainWidth, setMainWidth] = useState(() => {
    return window.innerWidth <= 768 ? 80 : 265;
  });

  // Theme color for the background of the container
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  // Update mainWidth when the window width changes
  useEffect(() => {
    setMainWidth(width <= 768 ? 80 : 265);
  }, [width]);

  const contentMarginLeft = isClaudeOAuthFlow ? 0 : mainWidth;

  return (
    <Layout
      className="container"
      hasSider={!isClaudeOAuthFlow}
      style={{ backgroundColor: colorBgContainer }}
    >
      {/* Sidebar — hidden during Connect to Claude OAuth flow */}
      {!isClaudeOAuthFlow && (
        <Sider
          style={{
            backgroundColor: 'var(--secondary-Color)',
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
          breakpoint="md"
          width={mainWidth}
        >
          <GlobalSidebar />
        </Sider>
      )}

      {/* Main Content */}
      <Layout
        style={{
          marginLeft: contentMarginLeft,
          minHeight: '100vh',
          backgroundColor: colorBgContainer,
        }}
      >
        {HeaderComp && (
          <Affix offsetTop={0}>
            <Header
              style={{
                backgroundColor: colorBgContainer,
                borderBottom: `1px solid ${colorBorderSecondary}`,
              }}
              className="contentHeader"
            >
              <Row justify="center">
                <Col span={24} style={{ maxWidth: '2000px', overflow: 'hidden' }}>
                  <HeaderComp />
                </Col>
              </Row>
            </Header>
          </Affix>
        )}
        <Row
          style={{
            backgroundColor: colorBgContainer,
            minHeight: isClaudeOAuthFlow ? '100vh' : '100%',
            flex: 1,
          }}
          justify="center"
        >
          <Content
            className="contentContainer"
            style={{
              maxWidth: '2000px',
              overflow: 'hidden',
              width: '100%',
              backgroundColor: colorBgContainer,
              ...(location.pathname.includes('/ailabs/create') ||
              location.pathname.includes('/ailabs/edit')
                ? {
                    padding: '0px',
                  }
                : {}),
            }}
          >
            {children}
          </Content>
        </Row>
      </Layout>
    </Layout>
  );
}

export default AuthPageLayout;
