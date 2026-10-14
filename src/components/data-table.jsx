/**
 * DataTable — shadcn/ui's Data Table pattern (TanStack Table v9 + `ui/table`) in the dashboard
 * list look: rounded-lg ring container (same radius as inputs), a 44px muted header band (the
 * Tabs track surface), hairline row dividers (no vertical borders), soft row hover.
 *
 * Everything is optional and controlled-or-uncontrolled like TanStack: pass a state slice in
 * `state` (+ its `on*Change`) to control it, or `initialState` to seed it.
 *
 * Columns are TanStack column defs (`accessorKey` / `accessorFn` / `id`, `header`, `cell`)
 * plus `meta`:
 *   width, minWidth          <col> width (number = px, or any CSS length)
 *   align                    'left' | 'center' | 'right' (header + cells)
 *   className                classes on header and body cells
 *   headerClassName, cellClassName
 *   ellipsis                 single-line truncation with a native title for text content
 *   pin                      'start' | 'end' — sticky column (with scroll shadow)
 *   cellProps(record, index) extra <td> props (onClick, style, className, colSpan, rowSpan, title)
 *   headerProps(column)      extra <th> props
 *   filter                   header filter popover (see data-table/data-table-column-filter.jsx)
 * `header` / `cell` functions are called as plain functions (not mounted as components), so
 * columns may be re-created on every render without remounting cell content. Cells also get
 * `renderIndex` in their context: the row's index within the current page (sub rows: within
 * their parent).
 *
 * Sorting is opt-in per column (`enableSorting: true`, optional `sortFn`); the whole header
 * cell toggles asc -> desc -> off (`sortDescFirst: true` on a column starts with desc).
 */
import * as React from 'react';
import {
  columnFilteringFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  InboxIcon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Empty, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnFilter } from '@/components/data-table/data-table-column-filter';
import { resolveUpdater } from '@/components/data-table/adapters';

const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

const EMPTY_DATA = [];
const DEFAULT_PAGINATION = { pageIndex: 0, pageSize: 10 };
const NO_FILTERS = [];

/* ------------------------------------------------------------------ styles */

// Header band: the muted surface the Tabs track uses, with a hairline under it; rows get a
// soft muted hover. Colours stay opaque so pinned and sticky cells never show what scrolls
// beneath them.
const HEADER_BG = 'bg-muted';
const HEADER_BORDER = 'border-border';
const HEADER_HOVER_BG = 'hover:text-foreground';
const ROW_HOVER = '[&:hover>td]:bg-[color-mix(in_oklab,var(--color-muted)_45%,var(--color-card))]';
const ROW_SELECTED =
  '[&>td]:bg-[color-mix(in_oklab,var(--color-primary)_6%,var(--color-background))] [&:hover>td]:bg-[color-mix(in_oklab,var(--color-primary)_10%,var(--color-background))]';
const SUB_COMPONENT_BG = 'bg-[color-mix(in_oklab,var(--color-muted)_25%,var(--color-background))]';
// The first and last columns line up with a Panel's 20px padding.
const CELL_PADDING = {
  default: 'px-4 py-3 first:ps-5 last:pe-5',
  sm: 'px-3 py-2 first:ps-4 last:pe-4',
};
const ALIGN_CLASS = { left: 'text-start', center: 'text-center', right: 'text-end' };
const SHADOW_BASE =
  "after:pointer-events-none after:absolute after:inset-y-0 after:w-6 after:transition-shadow after:duration-200 after:ease-out-quad after:content-['']";
const START_SHADOW = 'after:end-0 after:translate-x-full';
const START_SHADOW_SHOW =
  'after:shadow-[inset_10px_0_8px_-8px_color-mix(in_oklab,var(--color-foreground)_14%,transparent)]';
const END_SHADOW = 'after:start-0 after:-translate-x-full';
const END_SHADOW_SHOW =
  'after:shadow-[inset_-10px_0_8px_-8px_color-mix(in_oklab,var(--color-foreground)_14%,transparent)]';

/* ----------------------------------------------------------------- helpers */

const renderTemplate = (template, context) =>
  typeof template === 'function' ? template(context) : template;

/** Renders a value the way a plain table cell would: text, numbers and elements; objects -> nothing. */
function defaultCell({ getValue }) {
  const value = getValue();
  if (value === null || value === undefined || typeof value === 'boolean') return null;
  if (typeof value === 'object' && !Array.isArray(value) && !React.isValidElement(value)) {
    return null;
  }
  return value;
}

const DEFAULT_COLUMN = {
  header: () => null,
  cell: defaultCell,
  enableSorting: false,
  sortUndefined: false,
};

/** Row key `record.key` when present (index otherwise), as list UIs conventionally use. */
function defaultGetRowId(record, index, parent) {
  const key = record?.key;
  if (key !== undefined && key !== null) return String(key);
  return parent ? `${parent.id}.${index}` : String(index);
}

const isTextContent = node => typeof node === 'string' || typeof node === 'number';

function cssLength(value) {
  return typeof value === 'number' ? `${value}px` : value;
}

/** Sticky offsets for pinned columns from measured header cell widths. */
function usePinnedOffsets(tableRef, leafColumns, enabled) {
  const [widths, setWidths] = React.useState({});
  const columnIds = leafColumns.map(c => c.id).join('|');
  React.useLayoutEffect(() => {
    if (!enabled || !tableRef.current) return undefined;
    const measure = () => {
      const next = {};
      tableRef.current?.querySelectorAll('thead th[data-column-id]').forEach(th => {
        next[th.dataset.columnId] = th.offsetWidth;
      });
      setWidths(prev => {
        const keys = Object.keys(next);
        if (keys.length === Object.keys(prev).length && keys.every(k => prev[k] === next[k])) {
          return prev;
        }
        return next;
      });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, [enabled, columnIds, tableRef]);

  return React.useMemo(() => {
    const offsets = {};
    if (!enabled) return offsets;
    let start = 0;
    leafColumns.forEach(column => {
      if (column.columnDef.meta?.pin === 'start') {
        offsets[column.id] = { side: 'start', offset: start };
        start += widths[column.id] || 0;
      }
    });
    let end = 0;
    [...leafColumns].reverse().forEach(column => {
      if (column.columnDef.meta?.pin === 'end') {
        offsets[column.id] = { side: 'end', offset: end };
        end += widths[column.id] || 0;
      }
    });
    const startIds = leafColumns.filter(c => c.columnDef.meta?.pin === 'start').map(c => c.id);
    const endIds = leafColumns.filter(c => c.columnDef.meta?.pin === 'end').map(c => c.id);
    if (startIds.length) offsets[startIds[startIds.length - 1]].edge = true;
    if (endIds.length) offsets[endIds[0]].edge = true;
    return offsets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, columnIds, widths]);
}

/** Horizontal scroll position of the table container (for pinned-column shadows). */
function useScrollPing(tableRef, enabled) {
  const [ping, setPing] = React.useState({ start: false, end: false });
  React.useLayoutEffect(() => {
    const container = tableRef.current?.parentElement;
    if (!enabled || !container) return undefined;
    const update = () => {
      const max = container.scrollWidth - container.clientWidth;
      const left = Math.abs(container.scrollLeft);
      const next = { start: left > 0, end: max > 0 && left < max - 1 };
      setPing(prev => (prev.start === next.start && prev.end === next.end ? prev : next));
    };
    update();
    container.addEventListener('scroll', update, { passive: true });
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(container);
      observer.observe(tableRef.current);
    }
    return () => {
      container.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [enabled, tableRef]);
  return ping;
}

function pinnedCellProps(pinInfo, ping, isHeader, stickyHeader) {
  if (!pinInfo) return { className: undefined, style: undefined };
  const isStart = pinInfo.side === 'start';
  const showShadow = pinInfo.edge && (isStart ? ping.start : ping.end);
  return {
    className: cn(
      'sticky',
      isHeader && stickyHeader ? 'z-30' : 'z-10',
      pinInfo.edge && SHADOW_BASE,
      pinInfo.edge && (isStart ? START_SHADOW : END_SHADOW),
      showShadow && (isStart ? START_SHADOW_SHOW : END_SHADOW_SHOW)
    ),
    style: isStart ? { insetInlineStart: pinInfo.offset } : { insetInlineEnd: pinInfo.offset },
  };
}

function SortIndicator({ direction }) {
  if (direction) {
    return (
      <HugeiconsIcon
        aria-hidden
        icon={direction === 'asc' ? ArrowUp01Icon : ArrowDown01Icon}
        strokeWidth={2.5}
        className="ms-0.5 size-3.5 shrink-0 text-primary"
      />
    );
  }
  // Unsorted: a faint hint that only shows when the header is hovered or focused.
  return (
    <HugeiconsIcon
      aria-hidden
      icon={UnfoldMoreIcon}
      strokeWidth={2}
      className="ms-0.5 size-3.5 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity duration-150 ease-out-quad group-hover/head:opacity-100 group-focus-visible/head:opacity-100"
    />
  );
}

// Tables are seen many times a day: a short, opacity-only stagger capped at ~200ms.
const ROW_STAGGER_MS = 25;
const ROW_STAGGER_MAX = 8;

function DefaultEmpty() {
  return (
    <Empty className="gap-2 p-4">
      <EmptyMedia variant="icon" className="mb-0 text-muted-foreground">
        <HugeiconsIcon icon={InboxIcon} strokeWidth={2} />
      </EmptyMedia>
      <EmptyDescription>Nothing here yet</EmptyDescription>
    </Empty>
  );
}

/**
 * Display column with a chevron that toggles `row.getIsExpanded()` (for `renderSubComponent`
 * or sub rows). Rows that cannot expand keep the space empty.
 */
function createExpandColumn({ id = 'expand', header = null, width = 48 } = {}) {
  return {
    id,
    header,
    enableSorting: false,
    meta: { width, align: 'center', className: 'px-2' },
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            row.toggleExpanded();
          }}
          aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
          aria-expanded={row.getIsExpanded()}
          className="inline-flex size-[18px] cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out-quad outline-hidden hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className={cn(
              'size-3.5 transition-transform duration-200 ease-out-quad rtl:rotate-180',
              row.getIsExpanded() && 'rotate-90 rtl:rotate-90'
            )}
          />
        </button>
      ) : null,
  };
}

/* ------------------------------------------------------------------- table */

/**
 * Props (all optional except `columns`):
 * - `columns`, `data`, `getRowId(record, index, parent)` (default: `record.key`, else index),
 *   `getSubRows(record)` for tree data.
 * - `state`, `initialState`, `onSortingChange`, `onPaginationChange`, `onRowSelectionChange`,
 *   `onExpandedChange`, `onColumnFiltersChange` — TanStack state (controlled or not).
 *   `onPaginationChange(next, prev)` receives resolved `{ pageIndex, pageSize }` values.
 * - `manualSorting`, `manualFiltering`, `manualPagination` + `rowCount` (server data).
 * - `enableSortingRemoval` (true), `enableMultiSort` (false), `sortDescFirst` (false),
 *   `getRowCanExpand(row)`, `paginateExpandedRows` (false: page size counts top-level rows).
 * - `pagination` (default true; `false` renders every row and no pager), `paginationProps`
 *   for `DataTablePagination` (align, size, showSizeChanger, pageSizeOptions, showLessItems,
 *   totalText, hideOnSinglePage). The pager is hidden when there are no rows.
 * - `loading` (dims the table and shows a spinner), `loadingIndicator` (replaces the spinner),
 *   `emptyState` (node shown when there are no rows; default "No data").
 * - `onRowClick(record, event)` (adds a pointer cursor), `getRowClassName(record, index)`,
 *   `getRowProps(record, index)` (any <tr> props), `renderSubComponent({ row })` (detail row
 *   under expanded rows, kept mounted once opened).
 * - `size` ('default' | 'sm'), `showHeader`, `stickyHeader`, `maxHeight` (scroll body; header
 *   sticks), `minWidth` (table width before horizontal scroll: number, CSS length,
 *   'max-content'), `tableLayout` ('auto' | 'fixed'), `className` (root), `headerClassName`
 *   (every header cell), `style`, `id`.
 */
function DataTable({
  columns,
  data,
  getRowId = defaultGetRowId,
  getSubRows,
  state,
  initialState,
  onSortingChange,
  onPaginationChange,
  onRowSelectionChange,
  onExpandedChange,
  onColumnFiltersChange,
  manualSorting,
  manualFiltering,
  manualPagination = false,
  rowCount,
  enableSortingRemoval = true,
  enableMultiSort = false,
  sortDescFirst = false,
  getRowCanExpand,
  paginateExpandedRows = false,
  pagination = true,
  paginationProps,
  loading = false,
  loadingIndicator,
  emptyState,
  onRowClick,
  getRowClassName,
  getRowProps,
  renderSubComponent,
  size = 'default',
  showHeader = true,
  stickyHeader = false,
  maxHeight,
  minWidth,
  tableLayout,
  className,
  headerClassName,
  style,
  id,
}) {
  const rows = data ?? EMPTY_DATA;
  const hasPager = pagination !== false;

  /* -------------------------------------------------------- pagination */
  const [innerPagination, setInnerPagination] = React.useState(
    () => initialState?.pagination ?? DEFAULT_PAGINATION
  );
  const rawPagination = state?.pagination ?? innerPagination;
  // Keep the page within range when data shrinks (display only; no change callback).
  // A missing / zero `rowCount` falls back to the data length.
  const mergedRowCount = manualPagination && rowCount > 0 ? rowCount : undefined;
  const knownTotal = mergedRowCount ?? rows.length;
  const lastPageIndex = Math.max(0, Math.ceil(knownTotal / rawPagination.pageSize) - 1);
  const effectivePagination =
    rawPagination.pageIndex > lastPageIndex
      ? { ...rawPagination, pageIndex: lastPageIndex }
      : rawPagination;

  const latestPagination = React.useRef(effectivePagination);
  latestPagination.current = effectivePagination;
  const handlePaginationChange = updater => {
    const prev = latestPagination.current;
    const next = resolveUpdater(updater, prev);
    latestPagination.current = next;
    setInnerPagination(next);
    onPaginationChange?.(next, prev);
  };

  /* ----------------------------------------------------------- filters */
  const [innerFilters, setInnerFilters] = React.useState(
    () => initialState?.columnFilters ?? NO_FILTERS
  );
  const columnFilters = state?.columnFilters ?? innerFilters;
  const handleColumnFiltersChange = updater => {
    const next = resolveUpdater(updater, columnFilters);
    setInnerFilters(next);
    onColumnFiltersChange?.(next);
    // Filtering goes back to the first page.
    if (hasPager) handlePaginationChange({ ...latestPagination.current, pageIndex: 0 });
  };

  /* ------------------------------------------------------------- table */
  const tableState = { ...state, pagination: effectivePagination, columnFilters };
  const options = {
    features,
    data: rows,
    columns,
    defaultColumn: DEFAULT_COLUMN,
    getRowId,
    state: tableState,
    onPaginationChange: handlePaginationChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    manualPagination: manualPagination || !hasPager,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    enableSortingRemoval,
    enableMultiSort,
    sortDescFirst,
    paginateExpandedRows,
  };
  if (getSubRows) options.getSubRows = getSubRows;
  if (initialState) options.initialState = initialState;
  if (onSortingChange) options.onSortingChange = onSortingChange;
  if (onRowSelectionChange) options.onRowSelectionChange = onRowSelectionChange;
  if (onExpandedChange) options.onExpandedChange = onExpandedChange;
  if (manualSorting !== undefined) options.manualSorting = manualSorting;
  if (manualFiltering !== undefined) options.manualFiltering = manualFiltering;
  if (mergedRowCount !== undefined) options.rowCount = mergedRowCount;
  if (getRowCanExpand) options.getRowCanExpand = getRowCanExpand;

  const table = useTable(options);

  /* ------------------------------------------------------------ layout */
  const tableRef = React.useRef(null);
  const leafColumns = table.getAllLeafColumns();
  const hasPinned = leafColumns.some(c => c.columnDef.meta?.pin);
  const pinOffsets = usePinnedOffsets(tableRef, leafColumns, hasPinned);
  const ping = useScrollPing(tableRef, hasPinned);
  const isSticky = stickyHeader || maxHeight !== undefined;
  const anyEllipsis = leafColumns.some(c => c.columnDef.meta?.ellipsis);
  const mergedLayout =
    tableLayout ??
    (hasPinned && minWidth !== undefined
      ? minWidth === 'max-content'
        ? 'auto'
        : 'fixed'
      : isSticky || anyEllipsis
        ? 'fixed'
        : 'auto');
  const sizeKey = size === 'sm' || size === 'small' ? 'sm' : 'default';
  const cellPadding = CELL_PADDING[sizeKey];

  const finalRows = table.getRowModel().rows;
  const topLevelIndex = new Map();
  finalRows.forEach(row => {
    if (row.depth === 0) topLevelIndex.set(row.id, topLevelIndex.size);
  });

  // Detail rows stay mounted once opened (hidden when collapsed).
  const openedDetails = React.useRef(new Set());

  const hasCols = leafColumns.some(c => c.columnDef.meta?.width || c.columnDef.meta?.minWidth);
  const colgroup = hasCols && (
    <colgroup>
      {leafColumns.map(column => (
        <col
          key={column.id}
          style={{
            width: cssLength(column.columnDef.meta?.width),
            minWidth:
              mergedLayout === 'auto' ? cssLength(column.columnDef.meta?.minWidth) : undefined,
          }}
        />
      ))}
    </colgroup>
  );

  const header = showHeader && (
    <TableHeader className="[&_tr]:border-b-0">
      {table.getHeaderGroups().map(headerGroup => (
        <TableRow key={headerGroup.id} className="border-b-0 hover:bg-transparent">
          {headerGroup.headers.map(h => {
            const { column } = h;
            const meta = column.columnDef.meta || {};
            const canSort = !h.isPlaceholder && column.getCanSort();
            const sorted = canSort ? column.getIsSorted() : false;
            const extra = meta.headerProps?.(column) || {};
            const {
              className: extraClassName,
              style: extraStyle,
              onClick: extraOnClick,
              ...extraRest
            } = extra;
            const pinned = pinnedCellProps(pinOffsets[column.id], ping, true, isSticky);
            const content = h.isPlaceholder
              ? null
              : renderTemplate(column.columnDef.header, h.getContext());
            const toggleSort = canSort ? column.getToggleSortingHandler() : undefined;
            const hasFilter = !h.isPlaceholder && !!meta.filter;
            const ellipsisTitle =
              meta.ellipsis && isTextContent(content) ? String(content) : undefined;
            return (
              <TableHead
                key={h.id}
                data-column-id={column.id}
                colSpan={h.colSpan > 1 ? h.colSpan : undefined}
                aria-sort={
                  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                }
                tabIndex={canSort ? 0 : undefined}
                title={ellipsisTitle}
                {...extraRest}
                onClick={event => {
                  toggleSort?.(event);
                  extraOnClick?.(event);
                }}
                onKeyDown={
                  canSort
                    ? event => {
                        if (event.key === 'Enter') toggleSort(event);
                      }
                    : undefined
                }
                className={cn(
                  // 13px medium, one step under the 14px body; ~7:1 on the muted band.
                  'h-11 border-b text-[13px] leading-5 font-medium text-foreground/72',
                  HEADER_BG,
                  HEADER_BORDER,
                  cellPadding,
                  'py-3',
                  ALIGN_CLASS[meta.align] ?? 'text-start',
                  isSticky && 'sticky top-0 z-20',
                  canSort &&
                    cn(
                      'group/head cursor-pointer outline-hidden transition-colors duration-150 ease-out-quad select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset',
                      HEADER_HOVER_BG,
                      sorted && 'text-foreground'
                    ),
                  meta.ellipsis && 'truncate',
                  pinned.className,
                  meta.className,
                  meta.headerClassName,
                  headerClassName,
                  extraClassName
                )}
                style={{ ...pinned.style, ...extraStyle }}
              >
                {canSort || hasFilter ? (
                  <div
                    className={cn(
                      'flex items-center gap-0.5',
                      meta.align === 'center'
                        ? 'justify-center'
                        : meta.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                    )}
                  >
                    <span className={cn('min-w-0', meta.ellipsis && 'truncate')}>{content}</span>
                    <span className="flex shrink-0 items-center">
                      {canSort && <SortIndicator direction={sorted} />}
                      {hasFilter && <DataTableColumnFilter column={column} />}
                    </span>
                  </div>
                ) : (
                  content
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );

  const renderRow = (row, displayIndex) => {
    const record = row.original;
    const renderIndex = row.depth === 0 ? (topLevelIndex.get(row.id) ?? row.index) : row.index;
    const rowProps = getRowProps?.(record, displayIndex) || {};
    const {
      className: rowPropsClassName,
      onClick: rowPropsOnClick,
      style: rowPropsStyle,
      ...rowPropsRest
    } = rowProps;
    const selected = row.getIsSelected();
    const clickable = !!onRowClick;

    const cells = [];
    row.getAllCells().forEach(cell => {
      const { column } = cell;
      const meta = column.columnDef.meta || {};
      const extra = meta.cellProps?.(record, displayIndex) || {};
      const {
        className: extraClassName,
        style: extraStyle,
        colSpan,
        rowSpan,
        ...extraRest
      } = extra;
      if (colSpan === 0 || rowSpan === 0) return;
      const context = { ...cell.getContext(), renderIndex };
      const content = renderTemplate(column.columnDef.cell, context);
      const pinned = pinnedCellProps(pinOffsets[column.id], ping, false, isSticky);
      cells.push(
        <TableCell
          key={cell.id}
          colSpan={colSpan !== undefined && colSpan !== 1 ? colSpan : undefined}
          rowSpan={rowSpan !== undefined && rowSpan !== 1 ? rowSpan : undefined}
          title={meta.ellipsis && isTextContent(content) ? String(content) : undefined}
          {...extraRest}
          className={cn(
            'border-b border-border bg-card whitespace-normal [overflow-wrap:break-word]',
            cellPadding,
            ALIGN_CLASS[meta.align],
            meta.ellipsis && 'truncate',
            pinned.className,
            meta.className,
            meta.cellClassName,
            extraClassName
          )}
          style={{ ...pinned.style, ...extraStyle }}
        >
          {content}
        </TableCell>
      );
    });

    const mainRow = (
      <TableRow
        key={row.id}
        data-row-key={row.id}
        data-state={selected ? 'selected' : undefined}
        {...rowPropsRest}
        onClick={event => {
          onRowClick?.(record, event);
          rowPropsOnClick?.(event);
        }}
        className={cn(
          'border-b-0 transition-colors hover:bg-transparent data-[state=selected]:bg-transparent [&>td]:transition-colors [&>td]:duration-150 [&>td]:ease-out-quad',
          // New rows (first load, next page, filter) fade in with a short top-down stagger.
          'animate-in fade-in-0 duration-200 ease-out-quad fill-mode-both',
          selected ? ROW_SELECTED : ROW_HOVER,
          clickable && 'cursor-pointer',
          getRowClassName?.(record, displayIndex),
          rowPropsClassName
        )}
        style={{
          animationDelay: `${Math.min(displayIndex, ROW_STAGGER_MAX) * ROW_STAGGER_MS}ms`,
          ...rowPropsStyle,
        }}
      >
        {cells}
      </TableRow>
    );

    if (!renderSubComponent) return mainRow;
    const expanded = row.getIsExpanded();
    if (expanded) openedDetails.current.add(row.id);
    if (!openedDetails.current.has(row.id)) return mainRow;
    return (
      <React.Fragment key={row.id}>
        {mainRow}
        <TableRow
          data-slot="data-table-sub-row"
          className="border-b-0 hover:bg-transparent"
          style={{ display: expanded ? undefined : 'none' }}
        >
          <TableCell
            colSpan={leafColumns.length}
            className={cn(
              'border-b border-border whitespace-normal',
              SUB_COMPONENT_BG,
              cellPadding
            )}
          >
            {renderSubComponent({ row })}
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  // While loading with no rows yet, keep the body blank (the spinner sits over it) instead of
  // claiming there's nothing here.
  const emptyNode = loading ? (
    <div aria-hidden className="h-24" />
  ) : (
    (emptyState ?? <DefaultEmpty />)
  );

  const body = (
    <TableBody className="[&>tr:last-child>td]:border-b-0">
      {finalRows.length ? (
        finalRows.map((row, index) => renderRow(row, index))
      ) : (
        <TableRow className="border-b-0 hover:bg-transparent">
          <TableCell
            colSpan={leafColumns.length || 1}
            className={cn(
              'border-b-0 bg-background text-center whitespace-normal text-muted-foreground',
              cellPadding
            )}
          >
            {emptyNode}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  const total = table.getRowCount();
  const showPager = hasPager && total > 0;
  const tableWidth =
    minWidth === undefined ? undefined : minWidth === true ? 'auto' : cssLength(minWidth);

  return (
    <div
      id={id}
      data-slot="data-table"
      className={cn('relative', className)}
      style={{
        ...(maxHeight !== undefined ? { '--data-table-max-height': cssLength(maxHeight) } : null),
        ...style,
      }}
      aria-busy={loading || undefined}
    >
      <div
        className={cn(
          'relative transition-opacity duration-200 ease-out-quad',
          loading && 'pointer-events-none opacity-50 select-none'
        )}
      >
        <div
          className={cn(
            'isolate overflow-hidden rounded-lg bg-card text-sm text-foreground ring-1 ring-foreground/10',
            maxHeight !== undefined &&
              '[&>[data-slot=table-container]]:max-h-(--data-table-max-height) [&>[data-slot=table-container]]:overflow-y-auto'
          )}
        >
          <Table
            ref={tableRef}
            className="border-separate border-spacing-0 text-start"
            style={{
              tableLayout: mergedLayout,
              ...(tableWidth !== undefined ? { width: tableWidth, minWidth: '100%' } : null),
            }}
          >
            {colgroup}
            {header}
            {body}
          </Table>
        </div>
        {showPager && (
          <DataTablePagination
            table={table}
            size={sizeKey === 'sm' ? 'sm' : 'default'}
            {...paginationProps}
            className={cn('mt-5 mb-4', paginationProps?.className)}
          />
        )}
      </div>
      {loading && (
        <div
          data-slot="data-table-loading"
          // Quick loads finish before the spinner shows; slower ones fade it in.
          className="absolute inset-0 z-40 flex animate-in items-center justify-center delay-150 duration-200 fade-in-0 fill-mode-both"
        >
          <div className="flex flex-col items-center gap-3 text-primary">
            {loadingIndicator ?? <Spinner className="size-[21px]" />}
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable, DataTablePagination, createExpandColumn };
export { useRowSelection } from '@/components/data-table/use-row-selection';
export {
  compareRecords,
  filterRecords,
  keysFromRecord,
  orderFromSorting,
  pageChangeHandler,
  paginationFromPage,
  recordFromKeys,
  resolveUpdater,
  sorterFromSorting,
  sortingFromOrder,
  tableChangeHandlers,
} from '@/components/data-table/adapters';
