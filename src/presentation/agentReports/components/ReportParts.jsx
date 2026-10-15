import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils';

// Report and per-agent statuses (constants/agentReportTypes.js) → the design system's tones (§5).
const STATUS_VARIANT = {
  queued: 'sky',
  pending: 'sky',
  processing: 'sky',
  completed: 'success',
  done: 'success',
  partial: 'warning',
  failed: 'destructive',
};

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

/** Status badge; in-progress states spin. */
export function ReportStatusBadge({ status, label }) {
  const variant = STATUS_VARIANT[status] || 'secondary';
  const spinning = status === 'processing';
  return (
    <Badge variant={variant}>
      {spinning && (
        <HugeiconsIcon
          icon={Loading03Icon}
          strokeWidth={2}
          className="animate-spin motion-reduce:animate-none"
        />
      )}
      {label || status}
    </Badge>
  );
}

/** Titled surface with a header row, like the overview sections elsewhere in the dashboard. */
export function ReportSection({
  title,
  description,
  actions,
  flush = false,
  className,
  children,
  ...props
}) {
  const titleId = React.useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10',
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-pretty text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(!flush && 'p-5')}>{children}</div>
    </section>
  );
}
