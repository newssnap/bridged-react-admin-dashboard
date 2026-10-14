import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  PageHeader,
  PageToolbar,
  PageToolbarSpacer,
  ToolbarSearch,
} from '@/components/page-header';

const numberFormat = new Intl.NumberFormat('en-GB');

/**
 * Page header ("Add company") and the toolbar: result count + search. The header action hides
 * while the first-run empty state shows its own.
 */
const CompaniesTopbar = ({
  searchQuery,
  onSearchChange,
  onAddCompany,
  showCreateButton = true,
  count,
}) => (
  <>
    <PageHeader
      title="Companies"
      description="The companies your users belong to, and who is in each one."
      actions={
        showCreateButton && (
          <Button type="button" onClick={onAddCompany}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add company
          </Button>
        )
      }
    />

    <PageToolbar>
      <PageToolbarSpacer />
      {typeof count === 'number' && (
        <p className="shrink-0 text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {numberFormat.format(count)} {count === 1 ? 'company' : 'companies'}
        </p>
      )}
      <ToolbarSearch placeholder="Search companies" value={searchQuery} onChange={onSearchChange} />
    </PageToolbar>
  </>
);

export default CompaniesTopbar;
