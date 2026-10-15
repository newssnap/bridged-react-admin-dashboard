import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AgentReportMetricValue from './AgentReportMetricValue';

const UNIT_TAGS = {
  events: { variant: 'outline', label: 'Events' },
  people: { variant: 'sky', label: 'Unique people' },
};

function AgentReportKpiTiles({ kpis, agentCount }) {
  if (!kpis.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {agentCount > 1 && (
        <p className="text-[13px] text-muted-foreground">
          Totals across {agentCount} agents. Unique-people figures are summed per agent, so a
          visitor who used two agents is counted twice.
        </p>
      )}
      <div className="stagger-in grid grid-cols-1 overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(metric => {
          const unitTag = UNIT_TAGS[metric.unit];
          return (
            <div
              key={metric.key}
              className="-mb-px -me-px flex min-w-0 flex-col gap-2.5 border-e border-b px-5 py-4"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                {unitTag && <Badge variant={unitTag.variant}>{unitTag.label}</Badge>}
                {metric.help && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`About ${metric.label}`}
                        className="inline-flex rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <HugeiconsIcon
                          icon={InformationCircleIcon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-72">{metric.help}</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <AgentReportMetricValue metric={metric} size="large" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AgentReportKpiTiles;
