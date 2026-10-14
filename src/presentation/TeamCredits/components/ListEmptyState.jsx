import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, SearchRemoveIcon, WifiError01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

/**
 * The empty state of a credit table, in three cases: the load failed (Try again), nothing
 * matches the search / filter (Clear), or there is nothing yet (the page's add action).
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
  const mediaIcon = isError ? WifiError01Icon : filtered ? SearchRemoveIcon : icon;
  return (
    <Empty className="rounded-lg border border-dashed bg-muted/30 py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={mediaIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>{isError ? errorTitle : filtered ? filteredTitle : emptyTitle}</EmptyTitle>
        <EmptyDescription>
          {isError
            ? 'Check your connection and try again.'
            : filtered
              ? filteredDescription
              : emptyDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isError ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : filtered ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onAction}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            {actionLabel}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}

export default ListEmptyState;
