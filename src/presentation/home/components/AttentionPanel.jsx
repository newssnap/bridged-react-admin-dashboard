import React from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Building03Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  WorkHistoryIcon,
} from '@hugeicons/core-free-icons';
import { Panel } from '@/components/page-header';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

const ITEMS = [
  {
    key: 'outOfCredits',
    icon: CreditCardIcon,
    to: '/teams/credits',
    tone: 'destructive',
    title: count => `${plural(count, 'team', 'teams')} out of credits`,
    hint: 'Their usage and reports stop until credits are added.',
  },
  {
    key: 'inExecution',
    icon: WorkHistoryIcon,
    to: '/teams/custom-work',
    tone: 'sky',
    title: count => `${plural(count, 'piece', 'pieces')} of custom work in execution`,
    hint: 'Mark them completed once the work is delivered.',
  },
  {
    key: 'withoutCompany',
    icon: Building03Icon,
    to: '/teams',
    tone: 'warning',
    title: count => `${plural(count, 'team', 'teams')} without a company`,
    hint: 'Assign a company so their users group correctly.',
  },
];

/** Counts that need an admin's hand, each linking to the page that fixes it. */
function AttentionPanel({ attention, loading, error, onRetry }) {
  const items = ITEMS.filter(item => (attention?.[item.key] ?? 0) > 0);

  return (
    <Panel title="Needs attention" description="Things to follow up across teams.">
      {loading ? (
        <ul className="flex flex-col gap-1 px-2 pb-2" aria-hidden>
          {ITEMS.map(item => (
            <li key={item.key} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="size-9 rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-44 rounded-sm" />
                <Skeleton className="h-3 w-56 rounded-sm" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="flex flex-col items-start gap-3 px-5 pt-1 pb-4">
          <p className="text-sm text-muted-foreground">
            Couldn't load these checks. Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center gap-3 px-5 pt-1 pb-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">Nothing needs following up right now.</p>
          </div>
        </div>
      ) : (
        <ul className="stagger-in flex flex-col gap-0.5 px-2 pb-2">
          {items.map(item => {
            const count = attention[item.key];
            return (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="group/attention flex items-center gap-3 rounded-md px-3 py-2.5 outline-none transition-colors duration-150 ease-out-quad hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-md',
                      item.tone === 'destructive' && 'bg-destructive/10 text-destructive',
                      item.tone === 'warning' && 'bg-warning/10 text-warning',
                      item.tone === 'sky' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-pretty text-foreground">
                      {item.title(count)}
                    </span>
                    <span className="block text-xs text-pretty text-muted-foreground">
                      {item.hint}
                    </span>
                  </span>
                  <Badge variant={item.tone} className="tabular-nums">
                    {count}
                  </Badge>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out-quad group-hover/attention:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export default AttentionPanel;
