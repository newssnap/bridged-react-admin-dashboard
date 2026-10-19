import React from 'react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const initials = name =>
  (name || '')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

/** Signed-in admin: avatar, name and email. The admin has no profile page, so it isn't a link. */
const UserInfo = ({ collapsed = false }) => {
  const email = useSelector(state => state.auth.data.email);
  const name = localStorage.getItem('fullname') || '';
  const label = name || email || 'Admin';

  const avatar = (
    <Avatar className="size-8 shrink-0">
      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
        {initials(label)}
      </AvatarFallback>
    </Avatar>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="flex size-10 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            {avatar}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn('flex h-14 w-full min-w-0 items-center gap-2.5 rounded-lg px-2')}>
      {avatar}
      <span className="grid min-w-0 flex-1 animate-in leading-tight duration-300 ease-out-quad fade-in-0">
        {name && <span className="truncate text-sm font-medium">{name}</span>}
        {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
      </span>
    </div>
  );
};

export default UserInfo;
