import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Cancel01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { SegmentedControl } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AGENT_REPORT_TYPE_OPTIONS } from '../../../constants/agentReportTypes';
import { formatDateTime, formatDisplayDate } from '../controllers/agentReportMetrics';

const MAX_VISIBLE_AGENTS = 6;

// Always visible while a report is open: states exactly which agents and dates the numbers cover.
function AgentReportContextBar({
  campaigns,
  agentNames,
  dateSummary,
  agentType,
  onChangeType,
  typeDetectedFromData,
  generatedAt,
  expiresAt,
  onDownload,
  includesLeads,
  canDownload,
  onNewReport,
}) {
  const typeLayoutId = `report-view-type-${React.useId()}`;
  const agentText = campaign =>
    agentNames[campaign.id] ? `${agentNames[campaign.id]} (${campaign.id})` : campaign.id;
  const visibleCampaigns = campaigns.slice(0, MAX_VISIBLE_AGENTS);
  const hiddenCount = campaigns.length - visibleCampaigns.length;

  const allAgents = (
    <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto text-xs">
      {campaigns.map(campaign => (
        <li key={campaign.id} className="text-foreground">
          <span className="font-medium">{agentText(campaign)}</span>
          <span className="text-muted-foreground">
            {' '}
            · {formatDisplayDate(campaign.startDate)} – {formatDisplayDate(campaign.endDate)}
          </span>
        </li>
      ))}
    </ul>
  );

  const hoverList = (trigger, title) => (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
        {allAgents}
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="sticky top-14 z-10 -mx-(--page-gutter) border-b bg-background/85 px-(--page-gutter) py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Dates</span>
            {dateSummary.isUniform ? (
              <span className="text-base font-semibold text-foreground tabular-nums">
                {formatDisplayDate(dateSummary.startDate)} –{' '}
                {formatDisplayDate(dateSummary.endDate)}
              </span>
            ) : (
              hoverList(
                <Badge variant="warning" tabIndex={0} className="cursor-default">
                  <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
                  Different date ranges ({formatDisplayDate(dateSummary.startDate)} –{' '}
                  {formatDisplayDate(dateSummary.endDate)})
                </Badge>,
                'Date range per agent'
              )
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {typeDetectedFromData && (
              <span className="text-xs text-muted-foreground">
                View set from the agent type in the data; change it if needed
              </span>
            )}
            <SegmentedControl
              label="Report view"
              layoutId={typeLayoutId}
              options={AGENT_REPORT_TYPE_OPTIONS}
              value={agentType}
              onValueChange={onChangeType}
            />
            <Button onClick={onDownload} disabled={!canDownload}>
              <HugeiconsIcon icon={Download04Icon} strokeWidth={2} data-icon="inline-start" />
              {includesLeads ? 'Download Excel and leads' : 'Download Excel'}
            </Button>
            <Button variant="outline" onClick={onNewReport}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} data-icon="inline-start" />
              Close report
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 text-xs font-medium text-muted-foreground">
            Agents ({campaigns.length})
          </span>
          {visibleCampaigns.map(campaign => (
            <Badge key={campaign.id} variant="outline" className="max-w-full font-normal">
              <span className="truncate">{agentText(campaign)}</span>
            </Badge>
          ))}
          {hiddenCount > 0 &&
            hoverList(
              <Badge variant="outline" tabIndex={0} className="cursor-default">
                +{hiddenCount} more
              </Badge>,
              'All agents in this report'
            )}
        </div>
        <p className="text-xs text-muted-foreground">
          {generatedAt ? `Generated ${formatDateTime(generatedAt)}` : 'Not generated yet'}
          {expiresAt
            ? ` · Expires ${formatDateTime(expiresAt)} (reports are kept for one day)`
            : ''}
        </p>
      </div>
    </div>
  );
}

export default AgentReportContextBar;
