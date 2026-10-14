import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { hasValue } from '../utils/creditFormat';

/** Icon tile + team name over its company (first column of the credit tables). */
function TeamIdentity({ teamName, companyName, icon = UserGroupIcon, className }) {
  const name = hasValue(teamName) ? teamName : 'Unnamed team';
  return (
    <div className={cn('flex max-w-full min-w-0 items-center gap-3', className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground" title={name}>
          {name}
        </span>
        <span
          className="truncate text-xs text-muted-foreground"
          title={hasValue(companyName) ? companyName : undefined}
        >
          {hasValue(companyName) ? companyName : 'No company'}
        </span>
      </div>
    </div>
  );
}

export default TeamIdentity;
