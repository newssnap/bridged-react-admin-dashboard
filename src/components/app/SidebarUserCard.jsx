import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const initials = name =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

/** Sidebar identity row: avatar, name and secondary line. */
export default function SidebarUserCard({ name, email, photo, collapsed = false, onClick }) {
  return (
    <button
      type="button"
      data-slot="sidebar-user"
      onClick={onClick}
      className={cn(
        'group/user flex w-full min-w-0 items-center gap-2.5 rounded-lg text-start outline-hidden ring-sidebar-ring transition-colors duration-150 ease-out-quad hover:bg-sidebar-accent focus-visible:ring-2',
        collapsed ? 'size-10 justify-center p-0' : 'h-14 px-2'
      )}
    >
      <Avatar className="size-8 shrink-0">
        {photo && <AvatarImage src={photo} alt="" className="object-cover" />}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials(name || email)}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <>
          <span className="grid min-w-0 flex-1 leading-tight animate-in fade-in-0 duration-300 ease-out-quad">
            {name && <span className="truncate text-sm font-medium">{name}</span>}
            {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
          </span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out-quad group-hover/user:translate-x-0.5 animate-in fade-in-0 duration-300 ease-out-quad"
          />
        </>
      )}
    </button>
  );
}
