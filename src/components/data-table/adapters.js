/**
 * Small pure helpers that let existing table handlers keep their exact signatures while the
 * markup moves to `DataTable` (TanStack Table state). See docs/design-system.md §6 (Tables).
 *
 * Vocabulary used by the older handlers:
 * - page numbers are 1-based (`current`), TanStack's `pageIndex` is 0-based;
 * - sort orders are 'ascend' | 'descend' | null, TanStack uses `{ id, desc }[]`;
 * - row keys keep their original type (number or string), TanStack row ids are strings.
 */

/** Resolves a TanStack updater (value or `prev => next`) against `prev`. */
export function resolveUpdater(updater, prev) {
  return typeof updater === 'function' ? updater(prev) : updater;
}

/* ---------------------------------------------------------------- sorting */

/**
 * Turns a record comparator `(a, b) => number` (ascending order) into a TanStack `sortFn`.
 * TanStack reverses it for descending order, exactly like the old column sorter did.
 */
export function compareRecords(compare) {
  return (rowA, rowB) => compare(rowA.original, rowB.original);
}

/** `'ascend' | 'descend' | null` for one column -> TanStack `SortingState`. */
export function sortingFromOrder(columnId, order) {
  if (order === 'ascend') return [{ id: columnId, desc: false }];
  if (order === 'descend') return [{ id: columnId, desc: true }];
  return [];
}

/** TanStack `SortingState` -> `'ascend' | 'descend' | null` for `columnId`. */
export function orderFromSorting(sorting, columnId) {
  const entry = (sorting || []).find(s => s.id === columnId);
  if (!entry) return null;
  return entry.desc ? 'descend' : 'ascend';
}

/**
 * TanStack `SortingState` -> the sorter object older `onChange(pagination, filters, sorter)`
 * handlers read: `{ column, columnKey, field, order }` (`column` / `order` undefined when
 * nothing is sorted). `columns` are the TanStack column defs; `meta.field` (or
 * `accessorKey`) is reported as `field`.
 */
export function sorterFromSorting(sorting, columns) {
  const entry = (sorting || [])[0];
  if (!entry)
    return { column: undefined, order: undefined, field: undefined, columnKey: undefined };
  const column = (columns || []).find(col => (col.id ?? col.accessorKey) === entry.id);
  return {
    column,
    order: entry.desc ? 'descend' : 'ascend',
    field: column?.meta?.field ?? column?.accessorKey ?? entry.id,
    columnKey: entry.id,
  };
}

/* ------------------------------------------------------------- pagination */

/** `{ current, pageSize }` (1-based) -> TanStack `PaginationState`. */
export function paginationFromPage(current = 1, pageSize = 10) {
  return { pageIndex: Math.max(0, (current || 1) - 1), pageSize };
}

/**
 * Builds a `DataTable` `onPaginationChange(next, prev)` that calls page handlers with the old
 * argument shapes: `onShowSizeChange(current, size)` first when the page size changed, then
 * `onChange(page, pageSize)` — the same order and values the old pager used.
 *
 *   onPaginationChange={pageChangeHandler({ onChange: setPageNo })}
 */
export function pageChangeHandler({ onChange, onShowSizeChange } = {}) {
  return (next, prev = next) => {
    if (onShowSizeChange && next.pageSize !== prev.pageSize) {
      onShowSizeChange(prev.pageIndex + 1, next.pageSize);
    }
    onChange?.(next.pageIndex + 1, next.pageSize);
  };
}

/**
 * Keeps a whole-table `onChange(pagination, filters, sorter, extra)` handler working.
 *
 * `paginationConfig` is the object the old table received as `pagination` (it is echoed back
 * with the new `current` / `pageSize`, minus functions — like before). Returns the
 * `{ onPaginationChange, onSortingChange }` pair to spread on `DataTable`; `sorting` and
 * `pagination` are the current TanStack states (also passed in `state`).
 */
export function tableChangeHandlers({
  pagination,
  sorting,
  columns,
  paginationConfig = {},
  filters = {},
  onChange,
}) {
  const toPaginationParam = next => {
    const param = { current: next.pageIndex + 1, pageSize: next.pageSize };
    Object.keys(paginationConfig).forEach(key => {
      if (key === 'current' || key === 'pageSize') return;
      if (typeof paginationConfig[key] !== 'function') param[key] = paginationConfig[key];
    });
    return param;
  };
  return {
    onPaginationChange: (next, prev = pagination) => {
      if (next.pageSize !== prev.pageSize) {
        paginationConfig.onShowSizeChange?.(prev.pageIndex + 1, next.pageSize);
      }
      paginationConfig.onChange?.(next.pageIndex + 1, next.pageSize);
      onChange?.(toPaginationParam(next), filters, sorterFromSorting(sorting, columns), {
        action: 'paginate',
      });
    },
    onSortingChange: updater => {
      const next = resolveUpdater(updater, sorting);
      onChange?.(toPaginationParam(pagination), filters, sorterFromSorting(next, columns), {
        action: 'sort',
      });
    },
  };
}

/* -------------------------------------------------------------- filtering */

/**
 * Turns an `onFilter(value, record)` predicate into a TanStack `filterFn`. The filter value
 * is the array of applied keys (OR-ed, like before).
 */
export function filterRecords(onFilter) {
  const fn = (row, _columnId, values) => {
    const list = Array.isArray(values) ? values : [values];
    return list.some(value => onFilter(value, row.original));
  };
  fn.autoRemove = value =>
    value === undefined || value === null || (Array.isArray(value) && !value.length);
  return fn;
}

/* ------------------------------------------------------ expansion / keys */

/** Array of row keys -> TanStack record state (`{ [id]: true }`), used for expanded / selected. */
export function recordFromKeys(keys) {
  const record = {};
  (keys || []).forEach(key => {
    record[String(key)] = true;
  });
  return record;
}

/**
 * TanStack record state -> array of the ORIGINAL keys (types preserved): `keys` is the
 * current key list, `getRowKey` maps a record to its key and `table` resolves new ids.
 */
export function keysFromRecord(record, { keys = [], table, getRowKey }) {
  const byId = new Map(keys.map(key => [String(key), key]));
  return Object.keys(record || {})
    .filter(id => record[id])
    .map(id => {
      if (byId.has(id)) return byId.get(id);
      const row = table?.getCoreRowModel?.().rowsById[id];
      return row && getRowKey ? getRowKey(row.original) : id;
    });
}
