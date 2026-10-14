import React from 'react';
import { AnimatedNumber } from '@/components/animated-number';
import { Badge } from '@/components/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatNumber, ledgerUsage, NUMBER_LOCALE, usageStatus } from '../utils/creditFormat';

/**
 * A team's current balance, and how much of the credits assigned in its ledger have been used
 * (bar turns amber at 75%, red at 90%).
 */
function CreditBalanceSummary({ balance, history, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4" aria-hidden>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    );
  }

  const current = Number(balance) || 0;
  const { net, used, percent } = ledgerUsage(history, current);
  const status = usageStatus(percent);
  const showUsage = net > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Current balance</p>
          <p className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl leading-none font-semibold tracking-tight tabular-nums',
                current < 0 ? 'text-destructive' : 'text-foreground'
              )}
            >
              <AnimatedNumber value={current} locales={NUMBER_LOCALE} countUp />
            </span>
            <span className="text-sm text-muted-foreground">
              {current === 1 ? 'credit' : 'credits'}
            </span>
          </p>
        </div>
        {showUsage && <Badge variant={status.badge}>{status.label}</Badge>}
      </div>
      {showUsage && (
        <div className="flex flex-col gap-2">
          <Progress
            value={Math.min(100, percent)}
            className={cn('h-2', status.bar)}
            aria-label={`${formatNumber(percent)}% of assigned credits used`}
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatNumber(used)} of {formatNumber(net)} assigned credits used ·{' '}
            {formatNumber(percent)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default CreditBalanceSummary;
