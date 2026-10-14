import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function onEnterOrSpace(callback) {
  return event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };
}

/** Page numbers to show: 1 … (current ± buffer) … last, with "jump" items in the gaps. */
function getPagerItems(current, pageCount, showLessItems) {
  const buffer = showLessItems ? 1 : 2;
  const jump = showLessItems ? 3 : 5;
  if (pageCount <= 3 + buffer * 2) {
    return Array.from({ length: Math.max(pageCount, 1) }, (_, i) => ({
      type: 'page',
      page: i + 1,
      disabled: pageCount === 0,
    }));
  }
  let left = Math.max(1, current - buffer);
  let right = Math.min(current + buffer, pageCount);
  if (current - 1 <= buffer) right = 1 + buffer * 2;
  if (pageCount - current <= buffer) left = pageCount - buffer * 2;
  const items = [];
  for (let page = left; page <= right; page += 1) items.push({ type: 'page', page });
  if (current - 1 >= buffer * 2 && current !== 3) {
    items.unshift({ type: 'jump-prev', page: Math.max(1, current - jump) });
  }
  if (pageCount - current >= buffer * 2 && current !== pageCount - 2) {
    items.push({ type: 'jump-next', page: Math.min(pageCount, current + jump) });
  }
  if (left !== 1) items.unshift({ type: 'page', page: 1 });
  if (right !== pageCount) items.push({ type: 'page', page: pageCount });
  return items;
}

/**
 * Numbered pager for a `DataTable` (Qweek ghost page buttons with the sliding active
 * indicator). Reads and writes the table's `pagination` state, so it works the same for client
 * and `manualPagination` tables. Rendered by `DataTable` itself; use it directly only for a
 * custom layout.
 *
 * - `align`: 'start' | 'center' | 'end' (default 'end').
 * - `size`: 'default' | 'sm'.
 * - `showSizeChanger`: show the rows-per-page select (default: only when there are more
 *   than 50 rows). `pageSizeOptions`: numbers (default 10, 20, 50, 100).
 * - `showLessItems`: fewer page buttons around the current page.
 * - `totalText(total, [from, to])`: optional text shown before the pager.
 * - `hideOnSinglePage`: render nothing when everything fits on one page.
 */
function DataTablePagination({
  table,
  align = 'end',
  size = 'default',
  showSizeChanger,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showLessItems = false,
  totalText,
  hideOnSinglePage = false,
  disabled = false,
  className,
}) {
  const { pageIndex, pageSize } = table.state?.pagination ?? table.store.state.pagination;
  const total = table.getRowCount();
  const pageCount = Math.max(0, Math.ceil(total / pageSize));
  const current = Math.max(1, Math.min(pageIndex + 1, pageCount || 1));
  const isSmall = size === 'sm';
  const mergedShowSizeChanger = showSizeChanger ?? total > 50;

  if (hideOnSinglePage && total <= pageSize) return null;

  const goTo = page => {
    if (disabled || total <= 0) return;
    const next = Math.max(1, Math.min(page, pageCount));
    if (next === current) return;
    table.setPagination({ pageIndex: next - 1, pageSize });
  };

  const changePageSize = nextSize => {
    // Keep the current page number, clamped to the new last page.
    const newPageCount = Math.floor((total - 1) / nextSize) + 1;
    const nextCurrent = current > newPageCount && newPageCount !== 0 ? newPageCount : current;
    table.setPagination({ pageIndex: nextCurrent - 1, pageSize: nextSize });
  };

  const linkSize = isSmall ? 'icon-sm' : 'icon';
  const blockedClass = 'pointer-events-none opacity-50';

  const renderArrow = direction => {
    const isPrev = direction === 'prev';
    const blocked = disabled || (isPrev ? current <= 1 : current >= pageCount) || !pageCount;
    const onActivate = () => goTo(isPrev ? current - 1 : current + 1);
    return (
      <PaginationItem key={direction} title={isPrev ? 'Previous Page' : 'Next Page'}>
        <PaginationLink
          size={linkSize}
          role="button"
          tabIndex={blocked ? -1 : 0}
          aria-label={isPrev ? 'Previous page' : 'Next page'}
          aria-disabled={blocked || undefined}
          onClick={onActivate}
          onKeyDown={onEnterOrSpace(onActivate)}
          className={cn('cursor-pointer', blocked && blockedClass)}
        >
          <HugeiconsIcon
            icon={isPrev ? ArrowLeft01Icon : ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 rtl:rotate-180"
          />
        </PaginationLink>
      </PaginationItem>
    );
  };

  const items = getPagerItems(current, pageCount, showLessItems).map(item => {
    if (item.type === 'page') {
      const active = item.page === current && !item.disabled;
      const blocked = disabled || item.disabled;
      return (
        <PaginationItem key={`page-${item.page}`} title={String(item.page)}>
          <PaginationLink
            size={linkSize}
            isActive={active}
            role="button"
            tabIndex={blocked ? -1 : 0}
            aria-disabled={blocked || undefined}
            onClick={() => goTo(item.page)}
            onKeyDown={onEnterOrSpace(() => goTo(item.page))}
            className={cn(
              'cursor-pointer tabular-nums select-none',
              isSmall && 'text-xs',
              active && 'font-semibold text-foreground',
              blocked && blockedClass
            )}
          >
            {item.page}
          </PaginationLink>
        </PaginationItem>
      );
    }
    const isPrev = item.type === 'jump-prev';
    const label = `${isPrev ? 'Previous' : 'Next'} ${showLessItems ? 3 : 5} Pages`;
    return (
      <PaginationItem key={item.type} title={label}>
        <PaginationLink
          size={linkSize}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          onClick={() => goTo(item.page)}
          onKeyDown={onEnterOrSpace(() => goTo(item.page))}
          className={cn(
            'group/jump cursor-pointer text-muted-foreground hover:text-primary focus-visible:text-primary',
            disabled && blockedClass
          )}
        >
          <HugeiconsIcon
            icon={MoreHorizontalIcon}
            strokeWidth={2}
            className="size-4 group-hover/jump:hidden group-focus-visible/jump:hidden"
          />
          <HugeiconsIcon
            icon={isPrev ? ArrowLeftDoubleIcon : ArrowRightDoubleIcon}
            strokeWidth={2}
            className="hidden size-4 group-hover/jump:block group-focus-visible/jump:block rtl:rotate-180"
          />
        </PaginationLink>
      </PaginationItem>
    );
  });

  let sizeOptions = pageSizeOptions.map(Number);
  if (!sizeOptions.includes(pageSize))
    sizeOptions = [...sizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <Pagination
      data-slot="data-table-pagination"
      className={cn(
        'mx-0 w-full',
        align === 'start' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end',
        className
      )}
    >
      <PaginationContent className={cn('flex-wrap', isSmall ? 'gap-0.5' : 'gap-1')}>
        {totalText && (
          <PaginationItem
            className={cn('me-2 text-muted-foreground', isSmall ? 'text-xs' : 'text-sm')}
          >
            {totalText(total, [
              total === 0 ? 0 : (current - 1) * pageSize + 1,
              Math.min(current * pageSize, total),
            ])}
          </PaginationItem>
        )}
        {renderArrow('prev')}
        {items}
        {renderArrow('next')}
        {mergedShowSizeChanger && (
          <PaginationItem className="ms-2">
            <Select
              value={String(pageSize)}
              disabled={disabled}
              onValueChange={value => changePageSize(Number(value))}
            >
              <SelectTrigger size={isSmall ? 'sm' : 'default'} aria-label="Page Size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export { DataTablePagination };
