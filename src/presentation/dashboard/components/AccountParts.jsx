import React from 'react';
import { Badge } from '@/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const plural = (count, word, pluralWord = `${word}s`) =>
  `${new Intl.NumberFormat('en-GB').format(count)} ${count === 1 ? word : pluralWord}`;

// The API sends a blank (or a single space) when someone hasn't set a name yet.
export const realName = name => (name || '').trim();

export const initialsOf = (name, email) => {
  const source = realName(name) || (email || '').split('@')[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

/** Photo (or initials), name on top and email underneath; the email alone if there's no name. */
export function UserIdentity({ photo, name, email, className }) {
  const displayName = realName(name);
  const emailLink = email ? (
    <a
      href={`mailto:${email}`}
      onClick={event => event.stopPropagation()}
      className="truncate rounded-sm outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {email}
    </a>
  ) : null;

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Avatar className="size-9">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initialsOf(name, email)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        {displayName ? (
          <>
            <p className="truncate font-medium text-foreground">{displayName}</p>
            <p className="flex min-w-0 text-xs text-muted-foreground">{emailLink}</p>
          </>
        ) : (
          <p className="flex min-w-0 font-medium text-foreground">{emailLink ?? '—'}</p>
        )}
      </div>
    </div>
  );
}

/** Active / inactive account. */
export function UserStatusBadge({ status }) {
  if (status === 'active') return <Badge variant="success">Active</Badge>;
  if (status === 'inactive') return <Badge variant="secondary">Inactive</Badge>;
  return <span className="text-muted-foreground">—</span>;
}

/** Team owner, member, or no team yet (signing in as them creates one). */
export function UserRoleBadge({ record }) {
  if (record?.teamId) {
    return (
      <Badge variant={record.isTeamOwner ? 'secondary' : 'outline'}>
        {record.isTeamOwner ? 'Team owner' : 'Member'}
      </Badge>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="warning" tabIndex={0} className="cursor-default">
          No team
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Not part of a team yet. Signing in as this user creates a team for them.
      </TooltipContent>
    </Tooltip>
  );
}
