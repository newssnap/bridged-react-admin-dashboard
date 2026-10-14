import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/** Stands in for the companies table on first load: same ring, header band and row shape. */
const CompaniesTableSkeleton = ({ rows = 8 }) => (
  <div
    className="overflow-hidden rounded-lg ring-1 ring-foreground/10"
    role="status"
    aria-label="Loading companies"
  >
    <div className="flex h-11 items-center gap-4 border-b border-border bg-muted ps-5 pe-5">
      <Skeleton className="h-3 w-20 rounded-md" />
      <Skeleton className="ms-auto h-3 w-16 rounded-md sm:me-28" />
    </div>
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0"
      >
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-40 max-w-full rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <Skeleton className="hidden h-3.5 w-20 rounded-md sm:block" />
        <div className="flex w-20 justify-end gap-1">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export default CompaniesTableSkeleton;
