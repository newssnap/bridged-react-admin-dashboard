import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, SearchRemoveIcon, WifiError01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The empty state of a credit table, in the shell of the portal's `DashboardEmptyState`, in
 * three cases: the load failed (Try again), nothing matches the search / filter (Clear
 * filters), or there is nothing yet (the page's add action, as the primary button).
 */
function ListEmptyState({
  icon,
  isError,
  onRetry,
  errorTitle,
  filtered,
  filteredTitle,
  filteredDescription,
  onClearFilters,
  emptyTitle,
  emptyDescription,
  actionLabel,
  onAction,
}) {
  const firstRun = !isError && !filtered;
  const mediaIcon = isError ? WifiError01Icon : filtered ? SearchRemoveIcon : icon;
  const title = isError ? errorTitle : filtered ? filteredTitle : emptyTitle;
  const description = isError
    ? 'Check your connection and try again.'
    : filtered
      ? filteredDescription
      : emptyDescription;

  return (
    <div className="flex min-h-[500px] w-full flex-wrap items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-2 rounded-lg px-3 text-center text-balance motion-safe:animate-in motion-safe:duration-500 motion-safe:ease-out-expo motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-reduce:animate-in motion-reduce:fade-in-0">
        <div
          className={cn(
            'mb-2 flex size-10 items-center justify-center rounded-md motion-safe:animate-in motion-safe:duration-500 motion-safe:ease-out-expo motion-safe:zoom-in-90',
            firstRun ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          <HugeiconsIcon icon={mediaIcon} strokeWidth={2} className="size-[22px]" />
        </div>

        <h4 className="text-lg font-medium tracking-tight text-balance text-foreground">{title}</h4>

        <span className="block max-w-[360px] text-sm/relaxed text-pretty text-muted-foreground">
          {description}
        </span>

        {isError ? (
          <Button type="button" variant="outline" onClick={onRetry} className="mt-3">
            Try again
          </Button>
        ) : filtered ? (
          <Button type="button" variant="outline" onClick={onClearFilters} className="mt-3">
            Clear filters
          </Button>
        ) : (
          <Button type="button" onClick={onAction} className="mt-3">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ListEmptyState;
