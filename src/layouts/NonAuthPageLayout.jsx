import { Layout, theme } from 'antd';
import React from 'react';

const { Content } = Layout;

function NonAuthPageLayout({ children }) {
  // Theme color for the background of the container
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="container">
      <Layout>
        <Content
          style={{
            backgroundColor: colorBgContainer,
            padding: '0px',
          }}
          className="contentContainer"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default NonAuthPageLayout;
