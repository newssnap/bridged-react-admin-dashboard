import React, { useState } from 'react';
import { Col, Dropdown, Button, Row, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import Icon from '../../utils/components/Icon';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const UserInfo = ({ data }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [supportType, setSupportType] = useState('Support');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const fullName = `${data?.data?.firstname} ${data?.data?.lastname}`;
  const email = data?.data?.email;

  const dropdownMenu = [
    // {
    //   key: '1',
    //   label: (
    //     <Row justify="space-between" align="middle">
    //       <img
    //         className="ant-dropdown-link"
    //         onClick={e => e.preventDefault()}
    //         style={{
    //           cursor: 'pointer',
    //           width: 40,
    //           height: 40,
    //           objectFit: 'cover',
    //           borderRadius: 50,
    //           marginRight: 'var(--mpr-2)',
    //         }}
    //         alt="Avatar"
    //         src={
    //           data?.data?.photo ||
    //           'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    //         }
    //       />
    //       <div className="sidebarDropdown">
    //         <Title level={5} className="title sidebarUserInfo">
    //           {fullName}
    //         </Title>
    //         <Title level={5} className="paragraph sidebarUserInfo">
    //           {email}
    //         </Title>
    //       </div>
    //     </Row>
    //   ),
    // },
    {
      key: '2',
      label: 'Support',
      icon: <Icon style={{ marginRight: 'var(--mpr-3)' }} name="QuestionOutlined" />,
      onClick: () => {
        setSupportType('Support');
        setIsDrawerOpen(true);
      },
    },
    {
      key: '3',
      label: 'Feedback',
      icon: <Icon style={{ marginRight: 'var(--mpr-3)' }} name="MessageOutlined" />,
      onClick: () => {
        setSupportType('Feedback');
        setIsDrawerOpen(true);
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
              onClick={() => navigate('/profile')}
            >
              <Col>
                <img
                  style={{
                    cursor: 'pointer',
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 50,
                  }}
                  alt="Avatar"
                  src={
                    data?.data?.photo ||
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                  }
                />
              </Col>
              <Col {...{ xs: 0, sm: 0, md: 18, lg: 18, xl: 18 }}>
                <h3
                  style={{
                    fontWeight: 300,
                  }}
                  level={5}
                  className="title singleLine"
                >
                  {fullName}
                </h3>
                <p
                  style={{
                    marginTop: '5px',
                  }}
                  level={5}
                  className="paragraph singleLine opacity05"
                >
                  {email}
                </p>
              </Col>
            </Row>
          </Col>
          <Col {...{ xs: 0, sm: 0, md: 4, lg: 4, xl: 4 }}>
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
          </Col>
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
