import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const EMPTY = [];

const defaultGetRowKey = record => record?.key;

/** Rows of the current page (top level) plus all their descendants, in display order. */
function getPageRows(table) {
  const result = [];
  const walk = rows =>
    rows.forEach(row => {
      result.push(row);
      if (row.subRows?.length) walk(row.subRows);
    });
  walk(table.getRowModel().rows.filter(row => row.depth === 0));
  return result;
}

/**
 * Checkbox row selection for `DataTable` that keeps key-based selection handlers unchanged.
 *
 * Options (all optional):
 * - `getRowKey(record)` — the record's key (types kept: numbers stay numbers). Default `record.key`.
 * - `selectedRowKeys` (controlled) / `defaultSelectedRowKeys` (uncontrolled start).
 * - `onChange(keys, records, { type })` — `type` is 'single' (row checkbox) or 'all'
 *   (header checkbox). Keys of records no longer in `data` are dropped unless
 *   `preserveSelectedRowKeys` is true.
 * - `onSelect(record, selected, selectedRecords, nativeEvent)` — row checkbox, called before
 *   `onChange`.
 * - `onSelectAll(selected, selectedRecords, changedRecords)` — header checkbox, called before
 *   `onChange`; acts on the selectable rows of the current page (and their sub rows).
 * - `getCheckboxProps(record)` — `{ disabled }` per row.
 * - `columnWidth` (default 48), `hideSelectAll`.
 *
 * Returns `{ column, rowSelection, getRowId, selectedKeys }`:
 *   const selection = useRowSelection({ selectedRowKeys, onChange, getRowKey: r => r._id });
 *   <DataTable
 *     columns={[selection.column, ...columns]}
 *     getRowId={selection.getRowId}
 *     state={{ rowSelection: selection.rowSelection }}
 *     ...
 *   />
 * Customise the header / cell by spreading: `{ ...selection.column, header: ... }`;
 * `selection.renderCheckbox(row)` renders the default row checkbox.
 */
export function useRowSelection({
  getRowKey = defaultGetRowKey,
  selectedRowKeys,
  defaultSelectedRowKeys,
  onChange,
  onSelect,
  onSelectAll,
  getCheckboxProps,
  preserveSelectedRowKeys = false,
  columnWidth = 48,
  hideSelectAll = false,
} = {}) {
  const [innerKeys, setInnerKeys] = React.useState(defaultSelectedRowKeys || EMPTY);
  const selectedKeys = selectedRowKeys !== undefined ? selectedRowKeys || EMPTY : innerKeys;
  const preservedRef = React.useRef(new Map());

  const latest = React.useRef();
  latest.current = {
    getRowKey,
    selectedKeys,
    onChange,
    onSelect,
    onSelectAll,
    getCheckboxProps,
    preserveSelectedRowKeys,
  };

  const getRowId = React.useCallback((record, index, parent) => {
    const key = latest.current.getRowKey(record, index);
    if (key === undefined || key === null) return parent ? `${parent.id}.${index}` : String(index);
    return String(key);
  }, []);

  const rowSelection = React.useMemo(() => {
    const state = {};
    selectedKeys.forEach(key => {
      state[String(key)] = true;
    });
    return state;
  }, [selectedKeys]);

  // Shared helpers working on the table passed to header / cell renderers.
  const helpers = React.useMemo(() => {
    const findRecord = (table, key) => {
      const row = table
        .getCoreRowModel()
        .flatRows.find(r => latest.current.getRowKey(r.original) === key);
      if (row) return row.original;
      return preservedRef.current.get(key);
    };
    const isDisabled = record => !!latest.current.getCheckboxProps?.(record)?.disabled;

    const commit = (table, keys, type) => {
      const { preserveSelectedRowKeys: preserve, onChange: change } = latest.current;
      let availableKeys = [];
      let records = [];
      if (preserve) {
        const cache = new Map();
        keys.forEach(key => cache.set(key, findRecord(table, key)));
        preservedRef.current = cache;
        availableKeys = keys;
        records = keys.map(key => cache.get(key));
      } else {
        keys.forEach(key => {
          const record = findRecord(table, key);
          if (record !== undefined) {
            availableKeys.push(key);
            records.push(record);
          }
        });
      }
      setInnerKeys(availableKeys);
      change?.(availableKeys, records, { type });
    };

    const toggleRow = (table, record, nativeEvent) => {
      const { selectedKeys: current, getRowKey: rowKey, onSelect: select } = latest.current;
      const key = rowKey(record);
      const checked = current.includes(key);
      const keys = checked ? current.filter(k => k !== key) : [...current, key];
      if (select) {
        select(
          record,
          !checked,
          keys.map(k => findRecord(table, k)),
          nativeEvent
        );
      }
      commit(table, keys, 'single');
    };

    const pageState = table => {
      const { selectedKeys: current, getRowKey: rowKey } = latest.current;
      const keySet = new Set(current);
      const pageKeys = getPageRows(table)
        .filter(row => !isDisabled(row.original))
        .map(row => rowKey(row.original));
      return {
        keySet,
        pageKeys,
        all: pageKeys.length > 0 && pageKeys.every(key => keySet.has(key)),
        some: pageKeys.some(key => keySet.has(key)),
      };
    };

    const toggleAll = table => {
      const { keySet, pageKeys, all } = pageState(table);
      const changed = [];
      if (all) {
        pageKeys.forEach(key => {
          keySet.delete(key);
          changed.push(key);
        });
      } else {
        pageKeys.forEach(key => {
          if (!keySet.has(key)) {
            keySet.add(key);
            changed.push(key);
          }
        });
      }
      const keys = Array.from(keySet);
      latest.current.onSelectAll?.(
        !all,
        keys.map(k => findRecord(table, k)),
        changed.map(k => findRecord(table, k))
      );
      commit(table, keys, 'all');
    };

    return { toggleRow, toggleAll, pageState, isDisabled };
  }, []);

  const renderCheckbox = React.useCallback(
    (row, table) => {
      const record = row.original;
      const checked = latest.current.selectedKeys.includes(latest.current.getRowKey(record));
      const tableInstance = table ?? row.table;
      return (
        <Checkbox
          checked={checked}
          disabled={helpers.isDisabled(record)}
          aria-label="Select row"
          onClick={event => {
            event.stopPropagation();
            event.preventDefault();
            helpers.toggleRow(tableInstance, record, event.nativeEvent);
          }}
        />
      );
    },
    [helpers]
  );

  const column = React.useMemo(
    () => ({
      id: 'select',
      enableSorting: false,
      meta: { width: columnWidth, align: 'center', className: 'px-2' },
      header: ({ table }) => {
        if (hideSelectAll) return null;
        const { all, some, pageKeys } = helpers.pageState(table);
        return (
          <Checkbox
            checked={all ? true : some ? 'indeterminate' : false}
            disabled={pageKeys.length === 0}
            aria-label="Select all"
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
              helpers.toggleAll(table);
            }}
          />
        );
      },
      cell: ({ row, table }) => renderCheckbox(row, table),
    }),
    // selectedKeys re-creates the column so memoised renderers see the new state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [helpers, renderCheckbox, columnWidth, hideSelectAll, selectedKeys]
  );

  return { column, rowSelection, getRowId, selectedKeys, renderCheckbox };
}
