import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Sidebar navigation for the dashboard shell.
 *
 * Takes the same `items` / `selectedKeys` / `openKeys` / `onOpenChange` / `onClick` /
 * `inlineCollapsed` contract as antd's inline <Menu>, so the navigation logic that
 * builds and drives it (SidebarMenu, navConfig) is unchanged:
 * - item.onClick(info) fires before the menu's onClick(info), like rc-menu
 * - info = { key, keyPath, domEvent, item }; keyPath is [childKey, parentKey] for children
 * - clicking a submenu title only toggles it through onOpenChange(nextOpenKeys)
 * - collapsed: an icon rail; labels in tooltips, submenus in a popup menu
 */

const itemBase =
  'group/nav-item flex w-full min-w-0 items-center gap-2.5 rounded-lg text-start text-sm font-medium text-muted-foreground outline-hidden ring-sidebar-ring transition-[color,background-color,box-shadow] duration-150 ease-out-quad hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50';

// The active item sits on a pill that glides between items (ActivePill), so the
// button itself has no active background and a lighter hover once active. Its label takes
// the brand colour, like its icon.
const activeItem =
  'relative data-active:text-primary data-active:hover:bg-transparent data-active:hover:text-primary';

/** Sliding active pill (layoutId spring), instant with reduced motion. */
function ActivePill({ layoutId }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      layoutId={layoutId}
      aria-hidden
      // Matches rounded-lg on the nav items (--radius); a number so the layout animation keeps it.
      style={{ borderRadius: 16 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.35, bounce: 0.12 }}
      className="pointer-events-none absolute inset-0 bg-background shadow-pill ring-1 ring-foreground/5 dark:bg-sidebar-accent dark:ring-white/5"
    />
  );
}

function NavIcon({ icon, active }) {
  if (!icon) return null;
  return (
    <span
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center transition-colors duration-150 ease-out-quad',
        active ? 'text-primary' : 'text-muted-foreground group-hover/nav-item:text-foreground'
      )}
    >
      {icon}
    </span>
  );
}

export default function NavMenu({
  items = [],
  selectedKeys = [],
  openKeys = [],
  onOpenChange,
  onClick,
  inlineCollapsed = false,
  className,
  style,
}) {
  const isSelected = key => selectedKeys.includes(key);
  const pillId = `nav-active-${React.useId()}`;

  const fireClick = (item, keyPath, domEvent) => {
    const info = { key: item.key, keyPath, domEvent, item };
    item.onClick?.(info);
    onClick?.(info);
  };

  const toggleOpen = (key, nextOpen) => {
    const isOpen = openKeys.includes(key);
    const open = nextOpen ?? !isOpen;
    if (open === isOpen) return;
    onOpenChange?.(open ? [...openKeys, key] : openKeys.filter(k => k !== key));
  };

  const renderLeaf = item => {
    const active = isSelected(item.key);
    const button = (
      <button
        type="button"
        data-active={active || undefined}
        aria-current={active ? 'page' : undefined}
        disabled={item.disabled}
        onClick={e => fireClick(item, [item.key], e)}
        className={cn(
          itemBase,
          activeItem,
          inlineCollapsed ? 'size-10 justify-center p-0' : 'h-9 px-2.5'
        )}
      >
        <NavIcon icon={item.icon} active={active} />
        {!inlineCollapsed && (
          // Fades in as the rail widens back out.
          <span className="min-w-0 flex-1 truncate animate-in fade-in-0 duration-300 ease-out-quad">
            {item.label}
          </span>
        )}
      </button>
    );

    return (
      <li key={item.key} className="relative">
        {active && <ActivePill layoutId={pillId} />}
        {inlineCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          button
        )}
      </li>
    );
  };

  const renderSubmenu = item => {
    const open = openKeys.includes(item.key);
    const childActive = item.children.some(child => isSelected(child.key));

    if (inlineCollapsed) {
      return (
        <li key={item.key} className="relative">
          {childActive && <ActivePill layoutId={pillId} />}
          <DropdownMenu open={open} onOpenChange={next => toggleOpen(item.key, next)}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-active={childActive || undefined}
                    className={cn(itemBase, activeItem, 'size-10 justify-center p-0')}
                  >
                    <NavIcon icon={item.icon} active={childActive} />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {!open && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
            <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-52">
              <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
              {item.children.map(child => (
                <DropdownMenuItem
                  key={child.key}
                  data-active={isSelected(child.key) || undefined}
                  className="data-active:font-semibold"
                  onSelect={e => fireClick(child, [child.key, item.key], e)}
                >
                  {child.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      );
    }

    return (
      <li key={item.key} className="relative">
        {/* The open group's row carries the pill; its pages are plain links below it. */}
        <div className="relative">
          {childActive && <ActivePill layoutId={pillId} />}
          <button
            type="button"
            aria-expanded={open}
            data-active={childActive || undefined}
            onClick={() => toggleOpen(item.key)}
            className={cn(itemBase, activeItem, 'h-9 px-2.5')}
          >
            <NavIcon icon={item.icon} active={childActive} />
            <span className="min-w-0 flex-1 truncate animate-in fade-in-0 duration-300 ease-out-quad">
              {item.label}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out-quad animate-in fade-in-0 duration-300 ease-out-quad',
                open && 'rotate-180'
              )}
            />
          </button>
        </div>
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-250 ease-height motion-reduce:transition-none',
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <ul
            className="ms-[19px] mt-1 mb-1 flex min-h-0 flex-col gap-0.5 overflow-hidden ps-2.5"
            inert={!open}
          >
            {item.children.map(child => {
              const active = isSelected(child.key);
              return (
                <li key={child.key} className="relative">
                  <button
                    type="button"
                    data-active={active || undefined}
                    aria-current={active ? 'page' : undefined}
                    onClick={e => fireClick(child, [child.key, item.key], e)}
                    className={cn(
                      itemBase,
                      'h-8 px-2.5 font-normal data-active:font-medium data-active:text-primary data-active:hover:text-primary'
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{child.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ul
        data-slot="nav-menu"
        className={cn('flex w-full flex-col gap-0.5', inlineCollapsed && 'items-center', className)}
        style={style}
      >
        {items.map(item => (item.children?.length ? renderSubmenu(item) : renderLeaf(item)))}
      </ul>
    </TooltipProvider>
  );
}
