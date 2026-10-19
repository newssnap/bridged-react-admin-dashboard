import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EMPTY = [];

function sameKeys(a, b) {
  const x = a || EMPTY;
  const y = b || EMPTY;
  return x.length === y.length && x.every((key, i) => key === y[i]);
}

/**
 * Header filter trigger + popover for a `DataTable` column, driven by `column.columnDef.meta.filter`:
 *
 *   meta: {
 *     filter: {
 *       render: ({ selectedKeys, setSelectedKeys, confirm, clearFilters, close, open }) => node,
 *       value,         // optional: controlled applied keys (array or null) — shows the active state
 *       icon,          // optional: node, or (filtered) => node
 *       onOpenChange,  // optional: (open) => void
 *     },
 *   }
 *
 * `selectedKeys` is a draft that is reset to the applied keys every time the popover opens.
 * `confirm()` closes the popover and applies the draft; `clearFilters()` empties the draft
 * (`clearFilters({ confirm: true, closeDropdown: true })` also applies / closes). Applied keys
 * become the TanStack column filter value only when the column has a `filterFn` (client
 * filtering); otherwise filtering stays with the caller (e.g. a server query).
 */
function DataTableColumnFilter({ column }) {
  const config = column.columnDef.meta?.filter;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(EMPTY);
  const draftRef = React.useRef(EMPTY);
  const hasFilterFn = typeof column.columnDef.filterFn === 'function';

  const tableValue = hasFilterFn ? column.getFilterValue() : undefined;
  const [innerApplied, setInnerApplied] = React.useState(null);
  const applied = config.value !== undefined ? config.value : (tableValue ?? innerApplied);
  const filtered = !!(applied && applied.length);

  const setSelectedKeys = keys => {
    draftRef.current = keys || EMPTY;
    setDraft(draftRef.current);
  };

  const triggerOpen = next => {
    setOpen(next);
    config.onOpenChange?.(next);
  };

  const applyKeys = keys => {
    const merged = keys && keys.length ? keys : null;
    if (sameKeys(merged, applied)) return;
    setInnerApplied(merged);
    if (hasFilterFn) column.setFilterValue(merged ?? undefined);
  };

  const confirm = ({ closeDropdown = true } = {}) => {
    if (closeDropdown) triggerOpen(false);
    applyKeys(draftRef.current);
  };

  const clearFilters = ({ confirm: doConfirm = false, closeDropdown = false } = {}) => {
    if (doConfirm) applyKeys(EMPTY);
    if (closeDropdown) triggerOpen(false);
    setSelectedKeys(EMPTY);
  };

  const onOpenChange = next => {
    if (next) setSelectedKeys(applied ? [...applied] : EMPTY);
    triggerOpen(next);
  };

  const icon =
    typeof config.icon === 'function'
      ? config.icon(filtered)
      : (config.icon ?? <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-3.5" />);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filter"
          data-filtered={filtered || undefined}
          onClick={event => event.stopPropagation()}
          className={cn(
            '-my-1 -me-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out-quad outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40',
            filtered && 'text-primary hover:text-primary'
          )}
        >
          {icon}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto gap-0 rounded-lg p-0"
        onClick={event => event.stopPropagation()}
        onOpenAutoFocus={event => event.preventDefault()}
        onCloseAutoFocus={event => event.preventDefault()}
      >
        {config.render({
          selectedKeys: draft,
          setSelectedKeys,
          confirm,
          clearFilters,
          close: () => triggerOpen(false),
          open,
        })}
      </PopoverContent>
    </Popover>
  );
}

export { DataTableColumnFilter };
