import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ROWS = [0, 1, 2, 3];

/** Stands in for the checklists table: header band, then rows with an icon tile, two lines,
 * the task count, two action buttons and the row chevron. */
export function ChecklistTableSkeleton() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10"
      data-slot="checklist-table-skeleton"
    >
      <div className="h-11 border-b bg-muted" />
      <div className="divide-y">
        {ROWS.map(row => (
          <div key={row} className="flex items-center gap-3 py-3 ps-5 pe-5">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-40 max-w-full rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
            <Skeleton className="h-4 w-16 shrink-0 rounded-md" />
            <div className="flex w-[120px] shrink-0 items-center justify-end gap-1">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Stands in for one checklist panel: title row, then task rows. */
export function ChecklistPanelSkeleton({ rows = 3 }) {
  return (
    <div aria-hidden className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-4 px-5 pt-4.5 pb-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-3.5 w-28 rounded-md" />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
      <div className="divide-y border-t">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-start gap-3 px-5 py-3.5">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
