import React from 'react';
import { Menu } from 'antd';
import Icon from '../../utils/components/Icon';
import { useLocation, useNavigate } from 'react-router-dom';

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
      className="sidebarMenu"
    />
  );

  return (
    <>
      {!secondary && menuComp(navItems)}
    </>
  );
};

export default SidebarMenu;
