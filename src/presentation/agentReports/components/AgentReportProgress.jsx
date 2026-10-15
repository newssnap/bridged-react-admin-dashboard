import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  Alert02Icon,
  ArrowDown01Icon,
  InformationCircleIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  AGENT_REPORT_POLL_INTERVAL_MS,
  AGENT_REPORT_STATUS_META,
  AGENT_STATUS_META,
} from '../../../constants/agentReportTypes';
import { toPlainAgentError } from '../controllers/agentReportMetrics';
import { ReportStatusBadge, plural } from './ReportParts';

const PAGE_SIZE = 20;

const agentLabel = agent =>
  agent.agentName ? `${agent.agentName} (${agent.agentId})` : agent.agentId;

function AgentErrorList({ agents }) {
  return (
    <ul className="mt-1 flex flex-col gap-0.5">
      {agents.map(agent => (
        <li key={agent.agentId}>
          <span className="font-medium text-foreground">{agentLabel(agent)}</span> —{' '}
          {agent.plainError}
        </li>
      ))}
    </ul>
  );
}

function PerAgentStatus({ agents, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [page, setPage] = useState(1);
  const pages = Math.ceil(agents.length / PAGE_SIZE);
  const visible = agents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="border-t">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-sm font-medium text-foreground outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        Per-agent status ({agents.length})
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200 ease-out-quad',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="reveal-in flex flex-col">
          <ul className="flex flex-col divide-y border-t">
            {visible.map(agent => {
              const meta = AGENT_STATUS_META[agent.status] || { label: agent.status };
              return (
                <li key={agent.agentId} className="flex flex-col gap-1 px-5 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <ReportStatusBadge status={agent.status} label={meta.label} />
                    <span className="min-w-0 truncate text-sm text-foreground">
                      {agentLabel(agent)}
                    </span>
                  </div>
                  {agent.plainError && (
                    <p className="text-xs text-destructive">{agent.plainError}</p>
                  )}
                </li>
              );
            })}
          </ul>
          {pages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t px-5 py-2.5 text-xs text-muted-foreground">
              <span className="tabular-nums">
                Page {page} of {pages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(value => value - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pages}
                  onClick={() => setPage(value => value + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentReportProgress({
  statusData,
  statusAgents,
  failedAgents,
  statusErrorText,
  isExpired,
  isPolling,
  isTerminal,
  onRunAgain,
  isSubmitting,
}) {
  const runAgainButton = (
    <Button variant="outline" size="sm" onClick={onRunAgain} disabled={isSubmitting}>
      {isSubmitting ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
      )}
      Run again
    </Button>
  );

  if (isExpired) {
    return (
      <Alert className="rounded-lg border-transparent bg-warning/10 text-[13px] *:[svg]:text-warning">
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <AlertTitle>This report has expired</AlertTitle>
        <AlertDescription>
          Reports are kept for one day after they're created. Run it again to get fresh numbers for
          the same agents and dates.
        </AlertDescription>
        <AlertAction>{runAgainButton}</AlertAction>
      </Alert>
    );
  }

  if (statusErrorText && !statusData) {
    return (
      <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
        <AlertTitle>Couldn't load the report status</AlertTitle>
        <AlertDescription>
          {isPolling ? `${statusErrorText} Retrying automatically…` : statusErrorText}
        </AlertDescription>
        <AlertAction>{runAgainButton}</AlertAction>
      </Alert>
    );
  }

  if (!statusData) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-lg bg-card px-5 py-4 text-sm text-muted-foreground ring-1 ring-foreground/10"
      >
        <Spinner className="size-4" />
        Checking report status…
      </div>
    );
  }

  const { status, progress = {} } = statusData;
  const total = progress.total || statusAgents.length || 0;
  // progress.completed already includes failed agents.
  const finished = progress.completed || 0;
  const failedCount = progress.failed || 0;
  const percent = total ? Math.round((finished / total) * 100) : 0;
  const statusMeta = AGENT_REPORT_STATUS_META[status] || { label: status };

  return (
    <div className="flex flex-col gap-4">
      {status === 'failed' && (
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>Couldn't generate the report</AlertTitle>
          <AlertDescription>
            {statusData.error && <p>{toPlainAgentError(statusData.error)}</p>}
            {failedAgents.length > 0 && <AgentErrorList agents={failedAgents} />}
            {!statusData.error && !failedAgents.length && (
              <p>No reason was given. Try running it again.</p>
            )}
          </AlertDescription>
          <AlertAction>{runAgainButton}</AlertAction>
        </Alert>
      )}

      {status === 'partial' && (
        <Alert className="rounded-lg border-transparent bg-warning/10 text-[13px] *:[svg]:text-warning">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>{plural(failedAgents.length, 'agent', 'agents')} had no data</AlertTitle>
          <AlertDescription>
            <p>The numbers below are complete for every other agent. These agents are missing:</p>
            <AgentErrorList agents={failedAgents} />
          </AlertDescription>
        </Alert>
      )}

      {statusErrorText && (
        <Alert
          variant={isPolling ? 'default' : 'destructive'}
          className={
            isPolling
              ? 'rounded-lg border-0 bg-muted/70 *:[svg]:text-muted-foreground'
              : 'border-destructive/20 bg-destructive/5'
          }
        >
          <HugeiconsIcon
            icon={isPolling ? InformationCircleIcon : AlertCircleIcon}
            strokeWidth={2}
          />
          <AlertTitle className="line-clamp-none">
            {isPolling
              ? `Lost contact with the server (${statusErrorText}). Retrying automatically…`
              : statusErrorText}
          </AlertTitle>
        </Alert>
      )}

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <ReportStatusBadge status={status} label={statusMeta.label} />
            <p className="text-sm text-foreground tabular-nums" aria-live="polite">
              <span className="font-medium">
                {finished} of {plural(total, 'agent', 'agents')}
              </span>{' '}
              finished
              {failedCount > 0 && <span className="text-destructive"> · {failedCount} failed</span>}
            </p>
          </div>
          <Progress
            value={percent}
            aria-label="Report progress"
            className={cn(
              'h-2',
              status === 'failed' && '*:data-[slot=progress-indicator]:bg-destructive',
              isTerminal && status !== 'failed' && '*:data-[slot=progress-indicator]:bg-success'
            )}
          />
          {!isTerminal && (
            <p className="text-xs text-muted-foreground">
              Reports usually take 30 seconds to 5 minutes. Keep this page open; the status is
              checked every {AGENT_REPORT_POLL_INTERVAL_MS / 1000} seconds.
            </p>
          )}
        </div>
        {statusAgents.length > 0 && (
          <PerAgentStatus
            agents={statusAgents}
            defaultOpen={!isTerminal || failedAgents.length > 0}
          />
        )}
      </div>
    </div>
  );
}

export default AgentReportProgress;
