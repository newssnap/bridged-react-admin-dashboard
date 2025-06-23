import { Col, Divider, Row, Skeleton } from 'antd';
import { useUserInfoQuery } from '../services/api';
import UserInfo from './sidebar/UserInfo';
import SidebarMenu from './sidebar/SidebarMenu';
import { Link } from 'react-router-dom';

// Skeleton component for loading state
const SkeletonLoader = () => (
  <Skeleton.Button
    size="large"
    block
    active
    style={{
      backgroundColor: '#34374c',
      borderRadius: '0px',
      height: '74px',
    }}
  />
);

function GlobalSidebar() {
  // const { data, isLoading } = useUserInfoQuery();
  return (
    <>
      <Row
        style={{
          height: '100%',
        }}
        className="sidebar"
      >
        {/* Logo and Primary Navigation */}
        <Col
          style={{
            alignSelf: 'flex-start',
          }}
          span={24}
        >
          <Link to="/">
            <img alt="Company" className="companyLogo" src={`/company/logo_White.png`} />
          </Link>
          <SidebarMenu />
        </Col>

        {/* Secondary Navigation and User Info */}
        <Col
          style={{
            alignSelf: 'flex-end',
          }}
          span={24}
        >
          {/* Divider */}
          <Row
            justify="center"
            align="middle"
            style={{
              width: '100%',
            }}
          >
            <Col {...{ xs: 24, sm: 24, md: 20, lg: 20, xl: 20 }}>
              <Divider
                style={{
                  marginBottom: 'var(--mpr-2)',
                  backgroundColor: 'white',
                  opacity: 0.2,
                }}
              />
            </Col>
          </Row>

          {/* Secondary navigation */}
          <Col
            style={{
              marginBottom: 'var(--mpr-2)',
            }}
          >
            <SidebarMenu secondary />
          </Col>

          {/* User info or Skeleton loader during loading */}
          {/* {isLoading ? <SkeletonLoader /> : <UserInfo data={{}} />} */}
          <UserInfo data={{}} />
        </Col>
      </Row>
    </>
  );
}

export default GlobalSidebar;
