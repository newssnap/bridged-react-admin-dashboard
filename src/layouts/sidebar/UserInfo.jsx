import React, { useState } from 'react';
import { Col, Dropdown, Button, Row, Typography, Avatar } from 'antd';
import { MoreOutlined, UserOutlined } from '@ant-design/icons';
import Icon from '../../utils/components/Icon';
import { useNavigate } from 'react-router-dom';
import logoutHandler from '../../utils/controllers/logoutHandler';
import { useSelector } from 'react-redux';
const { Title } = Typography;

const UserInfo = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { fullname } = useSelector(state => state.auth.data);
  const dropdownMenu = [
    {
      key: '4',
      label: 'Logout',
      icon: <Icon style={{ marginRight: 'var(--mpr-3)' }} name="MessageOutlined" />,
      onClick: () => {
        logoutHandler();
      },
    },
  ];

  const rowStyle = {
    opacity: isHovered ? 0.8 : 1,
    backgroundColor: '#34374c',
    transition: '0.1s ease-in-out',
    cursor: 'pointer',
  };

  const userInfo = (
    <Row
      style={rowStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Col className="sidebarUserAccount" span={24}>
        <Row justify="space-between" align="middle">
          <Col {...{ xs: 24, sm: 24, md: 20, lg: 20, xl: 20 }}>
            <Row
              gutter={[15, 15]}
              justify="center"
              align="middle"
              wrap={false}
              // onClick={() => navigate('/profile')}
            >
              <Col>
                <Avatar icon={<UserOutlined />} size={40} />
              </Col>
              <Col {...{ xs: 0, sm: 0, md: 18, lg: 18, xl: 18 }}>
                <h3
                  style={{
                    fontWeight: 300,
                  }}
                  level={5}
                  className="title singleLine"
                >
                  {localStorage.getItem('fullname')}
                </h3>
              </Col>
            </Row>
          </Col>
          {/* <Col {...{ xs: 0, sm: 0, md: 4, lg: 4, xl: 4 }}>
            <Dropdown
              trigger="click"
              menu={{
                items: dropdownMenu,
              }}
              placement="topLeft"
              arrow
              onClick={e => e.preventDefault()}
            >
              <Button size="large" shape="circle" type="text" onClick={e => e.preventDefault()}>
                <MoreOutlined
                  style={{
                    fontSize: '1.1rem',
                    color: 'white',
                  }}
                />
              </Button>
            </Dropdown>
          </Col> */}
        </Row>
      </Col>
    </Row>
  );

  return (
    <>
      <Col {...{ xs: 24, sm: 24, md: 0, lg: 0, xl: 0 }}>
        <Dropdown
          trigger="click"
          menu={{
            items: dropdownMenu,
          }}
          arrow
        >
          {userInfo}
        </Dropdown>
      </Col>

      {/* User info  */}
      <Col {...{ xs: 0, sm: 0, md: 24, lg: 24, xl: 24 }}>{userInfo}</Col>
    </>
  );
};

export default UserInfo;
