import { useMemo } from 'react';
import { Card, Empty, Table, Tabs, Typography } from 'antd';

const { Paragraph } = Typography;

const COLUMN_SAMPLE_SIZE = 200;
const LONG_TEXT_LENGTH = 120;

const isNumeric = value =>
  typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(value));

const compareCells = (a, b) => {
  if (isNumeric(a) && isNumeric(b)) return Number(a) - Number(b);
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true });
};

const renderCell = value => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  const text = String(value);
  if (text.length <= LONG_TEXT_LENGTH) return text;
  return (
    <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }} style={{ margin: 0 }}>
      {text}
    </Paragraph>
  );
};

const buildColumn = (title, dataIndex) => ({
  title,
  dataIndex,
  key: dataIndex,
  sorter: (a, b) => compareCells(a[dataIndex], b[dataIndex]),
  render: renderCell,
  onCell: () => ({ style: { maxWidth: 420, verticalAlign: 'top' } }),
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
    if (category) columns.push({ title: category, key: `group-${columnIndex}`, children });
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
    return <Empty description="No rows for this period." />;
  }

  return (
    <Table
      rowKey="__rowKey"
      dataSource={dataSource}
      columns={columns}
      size="small"
      bordered
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 25,
        pageSizeOptions: [25, 50, 100],
        showSizeChanger: true,
        position: ['bottomLeft'],
        showTotal: total => `${total.toLocaleString()} rows`,
      }}
    />
  );
}

function AgentReportSheetTabs({ result, sheetNames }) {
  if (!sheetNames.length) {
    return (
      <Card size="small">
        <Empty description="This report has no sheets — there was no activity for these agents and dates." />
      </Card>
    );
  }

  return (
    <Card size="small" title="Report sheets">
      <Tabs
        destroyInactiveTabPane
        items={sheetNames.map(sheetName => {
          const rowCount = result.sheets[sheetName]?.rows?.length || 0;
          return {
            key: sheetName,
            label: `${sheetName} (${rowCount.toLocaleString()})`,
            children: <SheetTable sheet={result.sheets[sheetName]} />,
          };
        })}
      />
    </Card>
  );
}

export default AgentReportSheetTabs;
