import React from 'react';
import { Menu, Modal } from 'antd';
import Icon from '../../utils/components/Icon';
import { useLocation, useNavigate } from 'react-router-dom';
import logoutHandler from '../../utils/controllers/logoutHandler';

const getIcon = name => <Icon name={name} />;

const SidebarMenu = ({ secondary }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    {
      key: '',
      label: 'Dashboard',
      icon: getIcon('AppStoreOutlined'),
      onClick: () => navigate('/'),
      path: '/',
    },
    {
      key: 'companies',
      label: 'Companies',
      icon: getIcon('UsersOutlined'),
      onClick: () => navigate('/companies'),
      path: '/companies',
    },
    {
      key: 'defaultChecklist',
      label: 'Default Tasklist',
      icon: getIcon('BarChartOutlined'),
      onClick: () => navigate('/defaultChecklist'),
      path: '/defaultChecklist',
    },
  ];

  const bottomNavItems = [
    {
      key: 'logout',
      label: 'Logout',
      icon: getIcon('LogoutOutlined'),
    },
  ];

  const menuComp = items => (
    <Menu
      defaultSelectedKeys={['1']}
      mode="inline"
      selectedKeys={[location.pathname.split('/')[1]]}
      items={items}
      style={{
        border: 'none',
        width: '100%',
      }}
      onClick={e => {
        if (e.key === 'logout') {
          Modal.confirm({
            title: 'Logout',
            content: 'Are you sure you want to logout?',
            onOk: () => {
              logoutHandler();
            },
            okText: 'Logout',
            cancelText: 'Cancel',
            centered: true,
            okButtonProps: {
              danger: true,
            },
          });
        }
      }}
      className="sidebarMenu"
    />
  );

  return (
    <>
      {!secondary && menuComp(navItems)}
      {secondary && menuComp(bottomNavItems)}
    </>
  );
};

export default SidebarMenu;
