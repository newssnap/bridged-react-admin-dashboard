import React, { useState } from 'react';
import { Menu, Modal } from 'antd';
import Icon from '../../utils/components/Icon';
import { useLocation, useNavigate } from 'react-router-dom';
import logoutHandler from '../../utils/controllers/logoutHandler';

const getIcon = name => <Icon name={name} />;

const SidebarMenu = ({ secondary }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const handleOpenChange = keys => {
    const latestOpenKey = keys.find(key => !openKeys.includes(key));

    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);

      const parentItem = navItems.find(item => item.key === latestOpenKey);

      if (parentItem?.children?.length) {
        const firstChild = parentItem.children[0];

        navigate(firstChild.key);
      }
    } else {
      setOpenKeys([]);
    }
  };
  const navItems = [
    {
      key: '/',
      label: 'Dashboard',
      icon: getIcon('AppStoreOutlined'),
      onClick: () => navigate('/'),
    },
    {
      key: '/companies',
      label: 'Companies',
      icon: getIcon('UsersOutlined'),
      onClick: () => navigate('/companies'),
    },
    {
      key: '/defaultChecklist',
      label: 'Default Tasklist',
      icon: getIcon('BarChartOutlined'),
      onClick: () => navigate('/defaultChecklist'),
    },
    {
      key: 'teams',
      label: 'Billing Credits',
      icon: getIcon('SettingOutlined'),
      children: [
        {
          key: '/teams/credits',
          label: 'Team Credits',
          onClick: () => navigate('/teams/credits'),
        },
        {
          key: '/teams/custom-work',
          label: 'Custom Work',
          onClick: () => navigate('/teams/custom-work'),
        },
      ],
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
      selectedKeys={[location.pathname]}
      onOpenChange={handleOpenChange}
      openKeys={openKeys}
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
