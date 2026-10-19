import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// The API sends "Unknown" (or blanks) when someone hasn't set a name yet.
export const realName = name => {
  const trimmed = (name || '').trim();
  return trimmed && trimmed !== 'Unknown' ? trimmed : '';
};

/** A person's display name from whichever name fields the record carries. */
export const nameOf = person =>
  realName(
    person?.fullName ||
      person?.userFullName ||
      person?.userFullname ||
      person?.name ||
      [person?.firstName, person?.lastName].filter(Boolean).join(' ')
  );

export const initialsOf = (name, email) => {
  const source = realName(name) || (email || '').split('@')[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

/** Photo (or initials), name on top and email underneath; email alone if there's no name. */
function PersonIdentity({ photo, name, email, size = 'default', className }) {
  const displayName = realName(name);
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Avatar className={size === 'sm' ? 'size-7' : 'size-9'}>
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback
          className={cn(
            'bg-primary/10 font-semibold text-primary',
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}
        >
          {initialsOf(name, email)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-sm font-medium">{displayName || email || 'Unknown person'}</p>
        {displayName && email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
      </div>
    </div>
  );
}

export default PersonIdentity;
