import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, CheckListIcon, SearchRemoveIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

/**
 * The list page's empty state, shaped like the portal's DashboardEmptyState (Hugeicons in place
 * of the legacy Icon): nothing yet (with the one next step), or nothing matches the search.
 */
function ChecklistEmptyState({ searchQuery, title, description, actionLabel, onAction }) {
  const query = searchQuery?.trim();
  const searching = Boolean(query);

  return (
    <div className="flex min-h-[500px] w-full flex-wrap items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-2 rounded-lg px-3 text-center text-balance motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-500 motion-safe:ease-out-expo motion-reduce:animate-in motion-reduce:fade-in-0">
        <div
          className={
            searching
              ? 'mb-2 flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground motion-safe:animate-in motion-safe:zoom-in-90 motion-safe:duration-500 motion-safe:ease-out-expo'
              : 'mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary motion-safe:animate-in motion-safe:zoom-in-90 motion-safe:duration-500 motion-safe:ease-out-expo'
          }
        >
          <HugeiconsIcon
            icon={searching ? SearchRemoveIcon : CheckListIcon}
            strokeWidth={2}
            className="size-[22px]"
          />
        </div>

        <h4 className="text-lg font-medium tracking-tight text-balance text-foreground">
          {searching ? `No checklists match “${query}”` : title}
        </h4>

        <span className="block max-w-[360px] text-sm/relaxed text-pretty text-muted-foreground">
          {searching ? 'Try another name.' : description}
        </span>

        {!searching && onAction && (
          <Button type="button" onClick={onAction} className="mt-3">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ChecklistEmptyState;
