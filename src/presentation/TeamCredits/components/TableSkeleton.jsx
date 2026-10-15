import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/** Stands in for a DataTable while it first loads: same ring, header band and row rhythm. */
function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10"
      data-slot="table-skeleton"
    >
      <div className="flex h-11 items-center gap-6 border-b bg-muted px-5">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className="h-3 flex-1 bg-foreground/10" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-6 border-b px-5 py-3 last:border-b-0">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          {Array.from({ length: columns - 1 }, (_, index) => (
            <Skeleton key={index} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
