import React, { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File02Icon } from '@hugeicons/core-free-icons';
import { DataTable } from '@/components/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportSection } from './ReportParts';

const COLUMN_SAMPLE_SIZE = 200;
const LONG_TEXT_LENGTH = 120;
const PAGE_SIZE = 25;
const numberFormat = new Intl.NumberFormat('en-GB');

const isNumeric = value =>
  typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(value));

const compareCells = (a, b) => {
  if (isNumeric(a) && isNumeric(b)) return Number(a) - Number(b);
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true });
};

/** Long text folds to three lines with a "More" toggle. */
function LongText({ text }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className={expanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}>{text}</span>
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        className="rounded-sm text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {expanded ? 'Less' : 'More'}
      </button>
    </span>
  );
}

const renderCell = value => {
  if (value === null || value === undefined || value === '')
    return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'object') return JSON.stringify(value);
  const text = String(value);
  return text.length <= LONG_TEXT_LENGTH ? text : <LongText text={text} />;
};

const buildColumn = (title, key) => ({
  id: key,
  header: title,
  accessorFn: record => record[key],
  enableSorting: true,
  sortFn: (a, b) => compareCells(a.original[key], b.original[key]),
  meta: { minWidth: 120, cellClassName: 'max-w-[420px] align-top' },
  cell: ({ row }) => renderCell(row.original[key]),
});

// 'rows' sheets: column headers are the object keys.
const buildRowsTable = sheet => {
  const rows = sheet.rows || [];
  const keys = [];
  rows.slice(0, COLUMN_SAMPLE_SIZE).forEach(row => {
    Object.keys(row || {}).forEach(key => {
      if (!keys.includes(key)) keys.push(key);
    });
  });
  return {
    columns: keys.map(key => buildColumn(key, key)),
    dataSource: rows.map((row, index) => ({ ...row, __rowKey: index })),
  };
};

// 'aoa' sheets (Data Report): the categories row + merges become grouped column headers.
const buildAoaTable = sheet => {
  const headers = sheet.headers || [];
  const categories = sheet.categories || [];
  const categoryMerges = (sheet.merges || []).filter(merge => merge.s.r === 0);
  const columns = [];

  for (let columnIndex = 0; columnIndex < headers.length; ) {
    const merge = categoryMerges.find(item => item.s.c === columnIndex);
    const span = merge ? merge.e.c - merge.s.c + 1 : 1;
    const children = headers
      .slice(columnIndex, columnIndex + span)
      .map((header, offset) =>
        buildColumn(header || `Column ${columnIndex + offset + 1}`, `c${columnIndex + offset}`)
      );
    const category = categories[columnIndex];
    if (category) columns.push({ id: `group-${columnIndex}`, header: category, columns: children });
    else columns.push(...children);
    columnIndex += span;
  }

  const dataSource = (sheet.rows || []).map((row, rowIndex) => {
    const record = { __rowKey: rowIndex };
    headers.forEach((_, columnIndex) => {
      record[`c${columnIndex}`] = row?.[columnIndex];
    });
    return record;
  });

  return { columns, dataSource };
};

function SheetTable({ sheet }) {
  const { columns, dataSource } = useMemo(
    () => (sheet?.type === 'aoa' ? buildAoaTable(sheet) : buildRowsTable(sheet || {})),
    [sheet]
  );

  if (!dataSource.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">No rows for this period.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground tabular-nums">
        {numberFormat.format(dataSource.length)} {dataSource.length === 1 ? 'row' : 'rows'}
      </p>
      <DataTable
        size="sm"
        columns={columns}
        data={dataSource}
        getRowId={record => String(record.__rowKey)}
        pagination={dataSource.length > PAGE_SIZE}
        initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
        paginationProps={{ align: 'start', showSizeChanger: true, pageSizeOptions: [25, 50, 100] }}
        minWidth={640}
      />
    </div>
  );
}

// extraItems: additional tabs ({ key, label, children }) appended after the sheets (e.g. Leads).
function AgentReportSheetTabs({ result, sheetNames, extraItems = [] }) {
  const items = [
    ...sheetNames.map(sheetName => {
      const rowCount = result.sheets[sheetName]?.rows?.length || 0;
      return {
        key: sheetName,
        label: sheetName,
        count: rowCount,
        children: <SheetTable sheet={result.sheets[sheetName]} />,
      };
    }),
    ...extraItems,
  ];
  const [active, setActive] = useState(items[0]?.key);
  const current = items.some(item => item.key === active) ? active : items[0]?.key;

  return (
    <ReportSection
      title="Report sheets"
      description="Every sheet in the Excel download, with sortable columns."
      flush
    >
      {!sheetNames.length && (
        <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            This report has no sheets: there was no activity for these agents and dates.
          </p>
        </div>
      )}
      {items.length > 0 && (
        <Tabs value={current} onValueChange={setActive} className="gap-0">
          <div className="overflow-x-auto border-b px-3 pt-3">
            <TabsList variant="line" className="w-max">
              {items.map(item => (
                <TabsTrigger key={item.key} value={item.key} className="shrink-0">
                  {item.label}
                  {item.count != null && (
                    <span className="text-muted-foreground tabular-nums">
                      {numberFormat.format(item.count)}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {/* Only the open tab is mounted, so large sheets don't all render at once. */}
          {items.map(item => (
            <TabsContent key={item.key} value={item.key} className="p-5">
              {item.key === current && item.children}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </ReportSection>
  );
}

export default AgentReportSheetTabs;
