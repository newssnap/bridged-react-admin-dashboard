import React, { useEffect, useMemo, useState } from 'react';
import { Affix, Col, Layout, Row, theme } from 'antd';
import useGetWindowWidth from '../utils/controllers/useGetWindowWidth';
import GlobalSidebar from './GlobalSidebar';
// import SchedulingForm from '../utils/components/SchedulingForm';
import { useLocation } from 'react-router-dom';

const { Content, Sider, Header } = Layout;

function AuthPageLayout({ children, HeaderComp }) {
  const location = useLocation();

  // Custom hook to get window width
  const width = useGetWindowWidth();

  // Hide sidebar during Claude OAuth connect flow
  const isClaudeOAuthFlow = useMemo(() => {
    const oauthRedirect = new URLSearchParams(location.search).get('oauth_redirect');
    return Boolean(oauthRedirect);
  }, [location.search]);

  // State to manage the width of the main content
  const [mainWidth, setMainWidth] = useState(() => {
    return window.innerWidth <= 768 ? 80 : 265;
  });

  // Theme color for the background of the container
  const {
    token: { colorBgContainer, colorBorderSecondary, colorBgBase },
  } = theme.useToken();

  // Update mainWidth when the window width changes
  useEffect(() => {
    setMainWidth(width <= 768 ? 80 : 265);
  }, [width]);

  const contentMarginLeft = isClaudeOAuthFlow ? 0 : mainWidth;

  return (
    <Layout className="container" hasSider={!isClaudeOAuthFlow}>
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
        <Row style={{ backgroundColor: colorBgBase, height: '100%' }} justify="center">
          <Content
            className="contentContainer"
            style={{
              maxWidth: '2000px',
              overflow: 'hidden',
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
