import React from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, File02Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { ConfirmPopover } from '@/components/confirm-popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AGENT_REPORT_TYPES } from '../../../constants/agentReportTypes';
import {
  formatDateTime,
  formatDisplayDate,
  summarizeCampaignDates,
} from '../controllers/agentReportMetrics';

// Reports live for one day; expiresAt comes from the backend, createdAt + 1 day is the fallback.
const getExpiry = entry => {
  const expiresAt = entry.expiresAt ? dayjs(entry.expiresAt) : dayjs(entry.createdAt).add(1, 'day');
  const hoursLeft = expiresAt.diff(dayjs(), 'hour', true);
  if (entry.expired || hoursLeft <= 0) return { label: 'Expired', variant: 'secondary' };
  if (hoursLeft < 1) return { label: 'Expires in under 1h', variant: 'warning' };
  return { label: `Expires in ${Math.floor(hoursLeft)}h`, variant: 'success' };
};

function RecentAgentReports({ recentReports, activeReportId, onOpen, onRemove, onClear }) {
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10"
    >
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            Recent reports
          </h2>
          <p className="mt-0.5 text-[13px] text-pretty text-muted-foreground">
            Saved in this browser. Reports expire a day after they're created; then run them again.
          </p>
        </div>
        {recentReports.length > 0 && (
          <ConfirmPopover
            title="Clear recent reports?"
            description="This only clears the list in this browser."
            confirmText="Clear"
            confirmVariant="destructive"
            align="end"
            onConfirm={onClear}
          >
            <Button variant="ghost" size="sm" className="-me-2 text-muted-foreground">
              Clear
            </Button>
          </ConfirmPopover>
        )}
      </div>

      {recentReports.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No reports yet</p>
          <p className="text-[13px] text-muted-foreground">Reports you generate show up here.</p>
        </div>
      ) : (
        <ul className="stagger-in flex max-h-[560px] flex-col gap-0.5 overflow-y-auto p-2">
          {recentReports.map(entry => {
            const campaigns = entry.campaigns || [];
            const { startDate, endDate, isUniform } = summarizeCampaignDates(campaigns);
            const names = campaigns.map(campaign => entry.agentNames?.[campaign.id] || campaign.id);
            const expiry = getExpiry(entry);
            const isActive = entry.reportId === activeReportId;
            const open = () => onOpen(entry);
            return (
              <li key={entry.reportId}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-current={isActive || undefined}
                  onClick={open}
                  onKeyDown={event => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      open();
                    }
                  }}
                  className={cn(
                    'group/report flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors duration-150 ease-out-quad outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30',
                    isActive && 'bg-primary/[0.06] hover:bg-primary/[0.08]'
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">
                        {AGENT_REPORT_TYPES[entry.agentType]?.label || entry.agentType}
                      </Badge>
                      <Badge variant={expiry.variant}>{expiry.label}</Badge>
                    </div>
                    <p
                      className={cn(
                        'truncate text-sm text-foreground',
                        isActive ? 'font-semibold' : 'font-medium'
                      )}
                      title={names.join(', ')}
                    >
                      {names.slice(0, 3).join(', ')}
                      {names.length > 3 ? ` +${names.length - 3} more` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
                      {isUniform ? '' : ' (mixed ranges)'} · Created{' '}
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Remove from recent reports"
                        onClick={event => {
                          event.stopPropagation();
                          onRemove(entry.reportId);
                        }}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove from list</TooltipContent>
                  </Tooltip>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default RecentAgentReports;
