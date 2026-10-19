import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout03Icon } from '@hugeicons/core-free-icons';
import { confirm } from '@/components/confirm-dialog';
import NavMenu from '@/components/app/NavMenu';
import logoutHandler from '../../utils/controllers/logoutHandler';
import { BOTTOM_NAV, PRIMARY_NAV, navKeyFromPath } from '../../constants/navigation/navConfig';

const icon = i => <HugeiconsIcon icon={i} strokeWidth={2} className="size-[18px]" />;

const SidebarMenu = ({ secondary, inlineCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = navKeyFromPath(location.pathname);
  const [openKeys, setOpenKeys] = useState([]);

  const toItem = item => ({
    key: item.key,
    label: item.label,
    icon: item.icon && icon(item.icon),
    onClick: item.path ? () => navigate(item.path) : undefined,
    children: item.children?.map(toItem),
  });

  const items = (secondary ? BOTTOM_NAV : PRIMARY_NAV).map(toItem);

  // Keep the section holding the current page open while expanded.
  useEffect(() => {
    if (inlineCollapsed) {
      setOpenKeys([]);
      return;
    }
    const parent = PRIMARY_NAV.find(item => item.children?.some(c => c.key === activeKey));
    if (parent) setOpenKeys(keys => (keys.includes(parent.key) ? keys : [parent.key]));
  }, [activeKey, inlineCollapsed]);

  const handleOpenChange = keys => {
    const latest = keys.find(key => !openKeys.includes(key));
    if (!latest) {
      setOpenKeys([]);
      return;
    }
    setOpenKeys([latest]);
    // Opening a section while expanded lands on its first page.
    const parent = PRIMARY_NAV.find(item => item.key === latest);
    if (!inlineCollapsed && parent?.children?.[0]?.path) navigate(parent.children[0].path);
  };

  return (
    <NavMenu
      inlineCollapsed={inlineCollapsed}
      selectedKeys={[activeKey]}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      items={items}
      onClick={e => {
        if (e.keyPath?.length === 1 && !secondary) setOpenKeys([]);
        if (e.key === 'logout') {
          confirm({
            title: 'Log out?',
            description: "You'll need to sign in again to get back to the admin dashboard.",
            icon: <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />,
            onConfirm: () => logoutHandler(),
            confirmText: 'Log out',
            cancelText: 'Cancel',
          });
        }
      }}
    />
  );
};

export default SidebarMenu;
