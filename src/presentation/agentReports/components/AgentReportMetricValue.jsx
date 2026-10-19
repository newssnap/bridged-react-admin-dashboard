import React from 'react';
import { Badge } from '@/components/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LOW_SAMPLE_THRESHOLD, RATE_ARTIFACT_TEXT } from '../../../constants/agentReportTypes';
import { formatPercent } from '../controllers/agentReportMetrics';

export function LowSampleTag() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="warning" tabIndex={0}>
          Low sample
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Fewer than {LOW_SAMPLE_THRESHOLD} engaged visitors; treat this figure as indicative only.
      </TooltipContent>
    </Tooltip>
  );
}

// Renders one evaluated metric (see evaluateMetric) applying the data-honesty rules:
// implausible rates are greyed out as tracking artifacts, small samples are tagged.
function AgentReportMetricValue({ metric, size = 'default' }) {
  if (!metric) return <span className="text-muted-foreground">—</span>;

  const isLarge = size === 'large';
  const valueClass = cn(
    'tabular-nums',
    isLarge ? 'text-2xl leading-tight font-semibold tracking-tight sm:text-[28px]' : 'text-sm'
  );

  if (metric.isArtifact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="flex flex-col gap-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className={cn(valueClass, 'text-muted-foreground/60')}>n/a</span>
            <span className="text-xs text-muted-foreground/70">{RATE_ARTIFACT_TEXT}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          Calculated value was {formatPercent(metric.value)}, which is impossible.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (metric.kind === 'timePair') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className={valueClass}>{metric.display}</span>
          <span className="text-xs text-muted-foreground">engaged</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className={cn('tabular-nums', isLarge ? 'text-lg' : 'text-sm')}>
            {metric.secondaryDisplay}
          </span>
          <span className="text-xs text-muted-foreground">not engaged</span>
        </div>
        {metric.isLowSample && (
          <div>
            <LowSampleTag />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={valueClass}>{metric.display}</span>
      {metric.isLowSample && metric.hasValue && <LowSampleTag />}
    </div>
  );
}

export default AgentReportMetricValue;
