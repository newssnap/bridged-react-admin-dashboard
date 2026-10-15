import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChartHistogramIcon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { CopyButton } from '@/components/copy-button';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { AGENT_REPORT_METRICS } from '../../../constants/agentReportTypes';
import { formatDisplayDate } from '../controllers/agentReportMetrics';
import AgentReportMetricValue from './AgentReportMetricValue';
import { ReportSection } from './ReportParts';

const PAGE_SIZE = 10;
const UNIT_SUFFIX = { events: ' (events)', people: ' (people)' };

// Sortable value for a metric cell; artifacts and missing values sort last.
const sortValue = metric => {
  if (!metric || metric.isArtifact || !metric.hasValue) return -Infinity;
  if (metric.kind === 'timePair') return metric.value?.primary ?? -Infinity;
  return metric.value;
};

const compareMetrics = (a, b) => {
  const left = sortValue(a);
  const right = sortValue(b);
  return left === right ? 0 : left - right;
};

function AgentReportAgentTable({ rows, typeConfig, onOpenVisitorFrequency }) {
  const metricColumns = typeConfig.tableMetrics.map(metricKey => {
    const metric = AGENT_REPORT_METRICS[metricKey];
    return {
      id: metricKey,
      header: `${metric.label}${UNIT_SUFFIX[metric.unit] || ''}`,
      enableSorting: true,
      sortFn: (a, b) =>
        compareMetrics(a.original.metrics[metricKey], b.original.metrics[metricKey]),
      meta: { align: 'right', minWidth: 120 },
      cell: ({ row }) =>
        row.original.hasData ? (
          <div className="flex justify-end">
            <AgentReportMetricValue metric={row.original.metrics[metricKey]} />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    };
  });

  const columns = [
    {
      id: 'agent',
      header: 'Agent',
      enableSorting: true,
      sortFn: (a, b) =>
        (a.original.agentName || a.original.agentId).localeCompare(
          b.original.agentName || b.original.agentId
        ),
      meta: { pin: 'start', minWidth: 240 },
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium text-foreground">
              {record.agentName || 'Unnamed agent'}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="truncate font-mono">{record.agentId}</span>
              <CopyButton value={record.agentId} size="icon-xs" aria-label="Copy agent ID" />
            </span>
            {(record.agentDataTypeLabel || !record.hasData) && (
              <span className="flex flex-wrap gap-1">
                {record.agentDataTypeLabel && (
                  <Badge variant="outline">{record.agentDataTypeLabel}</Badge>
                )}
                {!record.hasData && <Badge variant="destructive">No data</Badge>}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'dates',
      header: 'Dates',
      meta: { minWidth: 190 },
      cell: ({ row }) =>
        row.original.startDate ? (
          <span className="whitespace-nowrap tabular-nums">
            {formatDisplayDate(row.original.startDate)} – {formatDisplayDate(row.original.endDate)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    ...metricColumns,
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      meta: { align: 'right', pin: 'end', width: 170 },
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenVisitorFrequency(row.original)}
          disabled={!row.original.startDate}
        >
          <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} data-icon="inline-start" />
          Visitor frequency
        </Button>
      ),
    },
  ];

  return (
    <ReportSection
      title="Per-agent breakdown"
      description="Each agent's numbers for its own dates. Sort by any column."
      flush
    >
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(record, index) => String(record?.agentId ?? index)}
        pagination={rows.length > PAGE_SIZE}
        initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
        paginationProps={{ align: 'start', showSizeChanger: false }}
        minWidth={720}
        className="rounded-none ring-0"
        emptyState={
          <p className="py-8 text-center text-sm text-muted-foreground">
            No per-agent statistics in this report. See the report sheets below.
          </p>
        }
      />
    </ReportSection>
  );
}

export default AgentReportAgentTable;
