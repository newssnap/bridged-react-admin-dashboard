import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const numberFormat = new Intl.NumberFormat('en-GB');

/** A count as "1,250"; a missing value as "—". */
export const formatCount = value =>
  value === undefined || value === null || Number.isNaN(Number(value))
    ? '—'
    : numberFormat.format(Number(value));

export const plural = (count, word, pluralWord = `${word}s`) =>
  `${formatCount(count)} ${count === 1 ? word : pluralWord}`;

// The API sends "Unknown", "—" or blanks when someone hasn't set a name yet.
const realName = name => {
  const trimmed = (name || '').trim();
  return trimmed && trimmed !== 'Unknown' && trimmed !== '—' ? trimmed : '';
};

const realEmail = email => (email && email !== '—' ? email : '');

const initialsOf = (name, email) => {
  const source = realName(name) || (realEmail(email) || '').split('@')[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

/** Photo (or initials), name on top and email underneath; email alone if there's no name. */
export function MemberIdentity({ photo, name, email, meta }) {
  const displayName = realName(name);
  const displayEmail = realEmail(email);
  const showEmail = displayName && displayEmail && displayName !== displayEmail;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initialsOf(name, email)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <p className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">
            {displayName || displayEmail || 'Unnamed user'}
          </span>
          {meta}
        </p>
        {showEmail && <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>}
      </div>
    </div>
  );
}
