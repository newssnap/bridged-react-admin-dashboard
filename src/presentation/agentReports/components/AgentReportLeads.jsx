import React, { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  Download04Icon,
  InboxIcon,
  SquareLock02Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { DataTable } from '@/components/data-table';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { formatDisplayDate } from '../controllers/agentReportMetrics';
import { plural } from './ReportParts';

const PAGE_SIZE = 10;
const numberFormat = new Intl.NumberFormat('en-GB');
const leadCount = count => `${numberFormat.format(count)} ${count === 1 ? 'lead' : 'leads'}`;

function LeadActionTable({ action }) {
  const columns = useMemo(
    () =>
      action.columns.map(column => ({
        id: column,
        header: column,
        enableSorting: true,
        sortFn: (a, b) =>
          String(a.original[column] ?? '').localeCompare(String(b.original[column] ?? '')),
        meta: { minWidth: 120, ellipsis: true },
        cell: ({ row }) => {
          const value = row.original[column];
          return value === null || value === undefined || value === '' ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            String(value)
          );
        },
      })),
    [action.columns]
  );
  // Row keys live on a copy so the source rows (also used for Excel) stay untouched.
  const dataSource = useMemo(
    () => action.rows.map((row, index) => ({ ...row, __leadKey: index })),
    [action.rows]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">{action.title}</span>
        <Badge variant="outline">{action.actionType}</Badge>
        <span className="text-xs text-muted-foreground tabular-nums">
          {leadCount(action.rows.length)}
        </span>
      </div>
      <DataTable
        size="sm"
        columns={columns}
        data={dataSource}
        getRowId={record => String(record.__leadKey)}
        pagination={dataSource.length > PAGE_SIZE}
        initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
        paginationProps={{
          align: 'start',
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        minWidth={640}
      />
    </div>
  );
}

// On-demand leads for the open report's agents and dates (personal data).
function AgentReportLeads({ leads, dateSummary, agentCount }) {
  const {
    loadLeads,
    isLoadingLeads,
    isLeadsLoaded,
    leadsErrors,
    leadsByAgent,
    totalLeads,
    hasLeads,
    downloadLeads,
    includeLeadsInReport,
    setIncludeLeadsInReport,
  } = leads;
  const switchId = React.useId();

  const dateText = dateSummary.isUniform
    ? `${formatDisplayDate(dateSummary.startDate)} – ${formatDisplayDate(dateSummary.endDate)}`
    : "each agent's own date range";

  return (
    <div className="flex flex-col gap-5">
      <Alert className="rounded-lg border-transparent bg-warning/10 text-[13px] *:[svg]:text-warning">
        <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2} />
        <AlertTitle className="line-clamp-none">
          Leads are personal data for internal use. Don't share them outside the client.
        </AlertTitle>
      </Alert>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={isLeadsLoaded ? 'outline' : 'default'}
          onClick={loadLeads}
          disabled={isLoadingLeads}
        >
          {isLoadingLeads ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} data-icon="inline-start" />
          )}
          {isLoadingLeads ? 'Loading leads…' : isLeadsLoaded ? 'Reload leads' : 'Load leads'}
        </Button>
        <p className="text-[13px] text-muted-foreground">
          For the {plural(agentCount, 'agent', 'agents')} in this report, {dateText}.
        </p>
      </div>

      {leadsErrors.map(errorText => (
        <Alert
          key={errorText}
          variant="destructive"
          className="border-destructive/20 bg-destructive/5"
        >
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle className="line-clamp-none">{errorText}</AlertTitle>
        </Alert>
      ))}

      {isLoadingLeads && (
        <div className="flex flex-col gap-2" aria-busy>
          <p className="text-xs text-muted-foreground">
            Loading leads; large agents can take a few seconds…
          </p>
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      )}

      {!isLoadingLeads && isLeadsLoaded && !hasLeads && !leadsErrors.length && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No leads in this period</p>
          <p className="text-[13px] text-muted-foreground">
            These agents didn't collect any leads for these dates.
          </p>
        </div>
      )}

      {!isLoadingLeads && hasLeads && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {leadCount(totalLeads)} in total
            </span>
            <Button variant="outline" onClick={downloadLeads}>
              <HugeiconsIcon icon={Download04Icon} strokeWidth={2} data-icon="inline-start" />
              Download leads (Excel)
            </Button>
            <label htmlFor={switchId} className="flex items-center gap-2 text-sm text-foreground">
              <Switch
                id={switchId}
                size="sm"
                checked={includeLeadsInReport}
                onCheckedChange={setIncludeLeadsInReport}
              />
              Include leads in the main report download
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {leadsByAgent.map(agent => (
              <section
                key={agent.agentId}
                className="flex flex-col gap-5 rounded-lg p-4 ring-1 ring-foreground/10"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                    {agent.agentName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono">{agent.agentId}</span> ·{' '}
                    {leadCount(agent.leadCount)}
                  </span>
                </div>
                {agent.actions.map(action => (
                  <LeadActionTable key={action.key} action={action} />
                ))}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AgentReportLeads;
