import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterHorizontalIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { CountBadge } from '@/components/count-badge';
import { useKeepMounted } from '@/components/keep-mounted';
import { PageToolbar, PageToolbarSpacer, ToolbarSearch } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { InputGroupAddon } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { toComboboxValue } from '@/lib/combobox';

const filterLabelClass = 'text-[12.5px] font-medium text-muted-foreground';

function FilterCombobox({ options, value, onSelect, placeholder, loading }) {
  return (
    <Combobox
      items={options ?? []}
      value={toComboboxValue(options, value)}
      onValueChange={(option, details) => {
        if (details?.reason !== 'input-clear') onSelect(option?.value ?? '');
      }}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
    >
      <ComboboxInput placeholder={placeholder} aria-label={placeholder} className="w-full">
        {loading && (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        )}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={option.value || 'all'} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** Filters (company, domain) · count · search. Filters apply as soon as they change. */
function TeamsToolbar({
  query,
  onQueryChange,
  count,
  company,
  onCompanyChange,
  companyOptions,
  domain,
  onDomainChange,
  domainOptions,
  isDomainsLoading,
}) {
  const keepMounted = useKeepMounted();
  const activeFilterCount = [company, domain].filter(Boolean).length;

  const resetFilters = () => {
    onCompanyChange('');
    onDomainChange('');
  };

  const filtersContent = (
    <div className="max-w-[640px]">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <h5 className={filterLabelClass}>Company</h5>
          <FilterCombobox
            placeholder="All companies"
            options={companyOptions}
            value={company}
            onSelect={onCompanyChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h5 className={filterLabelClass}>Domain</h5>
          <FilterCombobox
            placeholder="All domains"
            options={domainOptions}
            value={domain}
            onSelect={onDomainChange}
            loading={isDomainsLoading}
          />
        </div>
        <div className="flex items-end justify-start">
          <Button type="button" variant="outline" onClick={resetFilters}>
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
        <Button type="button" variant="ghost" onClick={resetFilters}>
          Reset
        </Button>
      )}

      <PageToolbarSpacer />
      {typeof count === 'number' && (
        <p className="shrink-0 text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {new Intl.NumberFormat('en-GB').format(count)} {count === 1 ? 'team' : 'teams'}
        </p>
      )}
      <ToolbarSearch placeholder="Search teams" value={query} onChange={onQueryChange} />
    </PageToolbar>
  );
}

export default TeamsToolbar;
