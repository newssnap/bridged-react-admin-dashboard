import React from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { Panel } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateAndTime } from '../../../utils/formatting/formateDate';

const initials = name =>
  (name || '')
    .split(/[\s·\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

const people = count => `${count} ${count === 1 ? 'person' : 'people'}`;

/** Freshness label ("Today", "2 days ago"); the exact time is in the tooltip. */
function LastActive({ date }) {
  const days = dayjs().startOf('day').diff(dayjs(date).startOf('day'), 'day');
  const label =
    days <= 0
      ? 'Today'
      : days === 1
        ? 'Yesterday'
        : days < 30
          ? `${days} days ago`
          : dayjs(date).format('D MMM YYYY');
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="shrink-0 rounded-sm text-[13px] text-muted-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" align="end">
        Last login {formatDateAndTime(date)}
      </TooltipContent>
    </Tooltip>
  );
}

function TeamRow({ team }) {
  const meta = [
    team.memberCount != null ? people(team.memberCount) : null,
    team.companyName,
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-150 ease-out-quad hover:bg-muted/40">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
        {initials(team.name) || (
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={team.name}>
          {team.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {meta.length ? meta.join(' · ') : '—'}
          {team.lastActiveBy && <> · {team.lastActiveBy}</>}
        </p>
      </div>
      <LastActive date={team.lastActiveAt} />
    </li>
  );
}

/** Teams whose members logged in most recently. */
function RecentTeamsPanel({ teams, loading, error, onRetry }) {
  return (
    <Panel
      title="Recently active teams"
      description="Ranked by their members' latest login."
      more={{ to: '/teams', label: 'All teams' }}
    >
      {loading ? (
        <ul className="flex flex-col gap-1 px-2 pb-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="size-9 rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-40 rounded-sm" />
                <Skeleton className="h-3 w-56 rounded-sm" />
              </div>
              <Skeleton className="h-3 w-14 rounded-sm" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="flex flex-col items-start gap-3 px-5 pt-1 pb-4">
          <p className="text-sm text-muted-foreground">
            Couldn't load recent activity. Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : teams.length === 0 ? (
        <p className="px-5 pt-1 pb-4 text-sm text-muted-foreground">
          No one has logged in yet. Teams show here once their members sign in.
        </p>
      ) : (
        <ul className="stagger-in flex flex-col gap-0.5 px-2 pb-2">
          {teams.map(team => (
            <TeamRow key={team.key} team={team} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default RecentTeamsPanel;
