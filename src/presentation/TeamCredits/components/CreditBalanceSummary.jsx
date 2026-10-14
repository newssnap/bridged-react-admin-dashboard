import React from 'react';
import { AnimatedNumber } from '@/components/animated-number';
import { Badge } from '@/components/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatNumber, ledgerUsage, NUMBER_LOCALE, usageStatus } from '../utils/creditFormat';

const clampPercent = percent => (!percent || percent < 0 ? 0 : percent > 100 ? 100 : percent);

/** Used vs remaining as one bar (the portal's credit usage `SplitBar`). */
function SplitBar({ percent, className, label }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out-quad',
          className
        )}
        style={{ width: `${clampPercent(percent)}%` }}
      />
    </div>
  );
}

/** "● Used   3,579   39%" */
function LegendRow({ swatch, label, value, percent }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={cn('size-2 shrink-0 rounded-xs', swatch)} aria-hidden />
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'ms-auto font-medium tabular-nums',
          value < 0 ? 'text-destructive' : 'text-foreground'
        )}
      >
        <AnimatedNumber value={value} locales={NUMBER_LOCALE} countUp />
      </span>
      <span className="w-14 text-end text-muted-foreground tabular-nums">
        <AnimatedNumber
          value={clampPercent(percent)}
          locales={NUMBER_LOCALE}
          format={{ maximumFractionDigits: 1 }}
          suffix="%"
          countUp
        />
      </span>
    </div>
  );
}

/**
 * A team's current balance, and how much of the credits assigned in its ledger have been used
 * (amber from 75%, red from 90%). Same anatomy as the portal's credit usage summary.
 */
function CreditBalanceSummary({ balance, history, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-5" aria-hidden>
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const current = Number(balance) || 0;
  const { net, used, percent } = ledgerUsage(history, current);
  const status = usageStatus(percent);
  const showUsage = net > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <p className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-4xl leading-none font-semibold tracking-tight tabular-nums',
              current < 0 ? 'text-destructive' : 'text-foreground'
            )}
          >
            <AnimatedNumber value={current} locales={NUMBER_LOCALE} countUp />
          </span>
          <span className="text-sm text-muted-foreground">
            {current === 1 ? 'credit remaining' : 'credits remaining'}
          </span>
        </p>
        {showUsage && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-sm text-muted-foreground tabular-nums">
              of {formatNumber(net)} assigned
            </p>
            <Badge variant={status.badge}>{status.label}</Badge>
          </div>
        )}
      </div>
      {showUsage && (
        <>
          <SplitBar
            percent={percent}
            className={status.bar}
            label={`${formatNumber(clampPercent(percent))}% of assigned credits used`}
          />
          <div className="flex flex-col gap-2.5">
            <LegendRow swatch={status.bar} label="Used" value={used} percent={percent} />
            <LegendRow
              swatch="bg-muted-foreground/30"
              label="Remaining"
              value={current}
              percent={100 - clampPercent(percent)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default CreditBalanceSummary;
