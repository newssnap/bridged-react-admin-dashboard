import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterHorizontalIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CountBadge } from '@/components/count-badge';
import { useKeepMounted } from '@/components/keep-mounted';
import { PageToolbar, PageToolbarSpacer, ToolbarSearch } from '@/components/page-header';
import OptionCombobox from './OptionCombobox';

const FILTER_LABEL_CLASS = 'text-[12.5px] font-medium text-muted-foreground';

/**
 * Filters (company, then team within it) in one popover that applies on change, the result
 * count, and the email search. A company can be created straight from the company list.
 */
function AccountsToolbar({
  companyOptions,
  isLoadingCompanies,
  onCompanySearch,
  onCreateCompany,
  isCreatingCompany,
  companyId,
  onCompanyChange,
  teamOptions,
  isLoadingTeams,
  teamId,
  onTeamChange,
  onResetFilters,
  countLabel,
  searchText,
  onSearchChange,
  searchPlaceholder,
}) {
  const keepMounted = useKeepMounted();
  const isCompanySelected = Boolean(companyId) && companyId !== 'all';
  const activeFilterCount = [companyId, teamId].filter(value => value && value !== 'all').length;

  const filtersContent = (
    <div className="max-w-[640px]">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <h5 className={FILTER_LABEL_CLASS}>Company</h5>
          <OptionCombobox
            placeholder="Company"
            options={[{ value: 'all', label: 'All companies' }, ...companyOptions]}
            value={companyId}
            onValueChange={value => onCompanyChange(value ?? 'all')}
            onSearch={onCompanySearch}
            onCreate={onCreateCompany}
            isCreating={isCreatingCompany}
            loading={isLoadingCompanies}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h5 className={FILTER_LABEL_CLASS}>Team</h5>
          <OptionCombobox
            placeholder={isCompanySelected ? 'Team' : 'Pick a company first'}
            options={teamOptions}
            value={teamId}
            onValueChange={value => onTeamChange(value ?? 'all')}
            loading={isLoadingTeams}
            disabled={!isCompanySelected}
          />
        </div>
        <div className="flex items-end justify-start">
          <Button type="button" variant="outline" onClick={onResetFilters}>
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
            Reset filters
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <PageToolbar>
      <Popover>
        <CountBadge count={activeFilterCount} size="sm">
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={2} data-icon="inline-start" />
              Filters
            </Button>
          </PopoverTrigger>
        </CountBadge>
        <PopoverContent {...keepMounted.contentProps} align="start" className="w-auto">
          <PopoverHeader>
            <PopoverTitle>Filters</PopoverTitle>
          </PopoverHeader>
          <div ref={keepMounted.outletRef} className="flex flex-col gap-4" />
        </PopoverContent>
      </Popover>
      {keepMounted.portal(filtersContent)}
      {activeFilterCount > 0 && (
        <Button type="button" variant="ghost" onClick={onResetFilters}>
          Reset
        </Button>
      )}

      <PageToolbarSpacer />

      {countLabel && (
        <p className="shrink-0 text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {countLabel}
        </p>
      )}
      <ToolbarSearch placeholder={searchPlaceholder} value={searchText} onChange={onSearchChange} />
    </PageToolbar>
  );
}

export default AccountsToolbar;
