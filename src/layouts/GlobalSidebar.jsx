import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/badge';
import CommandPaletteTrigger from '../utils/components/commandPalette/CommandPaletteTrigger';
import SidebarMenu from './sidebar/SidebarMenu';
import UserInfo from './sidebar/UserInfo';

function GlobalSidebar({ collapsed = false }) {
  const isDarkTheme = useSelector(state => state.app.isDarkTheme);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className={cn('shrink-0 px-3 pt-3.5 pb-2.5', collapsed && 'px-2 pt-3 pb-2')}>
        <div className={cn('flex min-h-6 items-center gap-2', collapsed && 'justify-center')}>
          {collapsed ? (
            <Link
              to="/"
              aria-label="Accounts"
              className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
            >
              B
            </Link>
          ) : (
            <Link
              to="/"
              className="flex min-w-0 animate-in items-center gap-2 leading-none duration-300 ease-out-quad fade-in-0"
            >
              <img
                alt="Bridged"
                className="block max-h-[22px] w-auto max-w-[84px] object-contain"
                src={isDarkTheme ? '/company/logo_White.png' : '/company/logo_Black.png'}
              />
              <Badge variant="outline" className="h-5 px-1.5 text-[11px]">
                Admin
              </Badge>
            </Link>
          )}
        </div>
      </div>

      <div className={cn('shrink-0 px-2 pb-2.5', collapsed && 'flex justify-center')}>
        <CommandPaletteTrigger collapsed={collapsed} />
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 pt-1 pb-2 sm:px-2',
          collapsed && 'px-2'
        )}
      >
        {!collapsed && (
          <div className="flex h-8 animate-in items-center px-2.5 text-xs font-medium text-sidebar-foreground/70 duration-300 ease-out-quad fade-in-0">
            Admin
          </div>
        )}
        <SidebarMenu inlineCollapsed={collapsed} />
      </div>

      <div className={cn('shrink-0 pb-3', collapsed && 'pb-2')}>
        <div className={cn('px-1 pt-1 sm:px-2', collapsed && 'px-2')}>
          <SidebarMenu secondary inlineCollapsed={collapsed} />
        </div>
        <div className={cn('px-1 sm:px-2', collapsed && 'flex justify-center px-2')}>
          <UserInfo collapsed={collapsed} />
        </div>
      </div>
    </div>
  );
}

export default GlobalSidebar;
