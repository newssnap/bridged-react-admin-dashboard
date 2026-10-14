import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Building03Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The list-page empty state (portal `DashboardEmptyState`, as used by Domains): a dashed
 * panel with a brand icon tile on first run, or a muted search tile when a search finds
 * nothing. The first-run state carries the page's create action.
 */
const CompaniesEmptyState = ({ searchQuery, onAddCompany }) => {
  const query = (searchQuery || '').trim();
  const isSearching = Boolean(query);

  return (
    <div className="flex min-h-[500px] w-full flex-wrap items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-2 rounded-lg px-3 text-center text-balance motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-500 motion-safe:ease-out-expo motion-reduce:animate-in motion-reduce:fade-in-0">
        <div
          className={cn(
            'mb-2 flex size-10 items-center justify-center rounded-md motion-safe:animate-in motion-safe:zoom-in-90 motion-safe:duration-500 motion-safe:ease-out-expo',
            isSearching ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          <HugeiconsIcon
            icon={isSearching ? Search01Icon : Building03Icon}
            strokeWidth={2}
            className="size-[22px]"
          />
        </div>

        <h4 className="text-lg font-medium tracking-tight text-balance text-foreground">
          {isSearching ? `No companies match “${query}”` : 'No companies yet'}
        </h4>

        <span className="block max-w-[360px] text-sm/relaxed text-pretty text-muted-foreground">
          {isSearching
            ? 'Try a different part of the company name.'
            : 'Add your first company to group users under it.'}
        </span>

        {!isSearching && onAddCompany && (
          <Button type="button" onClick={onAddCompany} className="mt-3">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add company
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompaniesEmptyState;
