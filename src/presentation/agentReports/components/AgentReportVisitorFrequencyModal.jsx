import React from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { Alert, AlertTitle } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  chartAnimation,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCount, formatDisplayDate, toNumber } from '../controllers/agentReportMetrics';

export const CONVERSION_HELP_TEXT =
  'Converted = visitor submitted a form or clicked a CTA link at least once (an actionTake recorded on the card).';

// actionTakeConversionPct is already a 0-100 percentage with 2 decimals: shown as-is, never scaled.
const formatPct = value => {
  const number = toNumber(value);
  return number === null ? '—' : `${number.toFixed(2)}%`;
};

const chartConfig = {
  visitors: { label: 'Visitors', color: 'var(--chart-1)' },
  converted: { label: 'Converted (%)', color: 'var(--chart-3)' },
};

function Stat({ label, children, help }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {help && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`About ${label}`}
                className="inline-flex rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-72">{help}</TooltipContent>
          </Tooltip>
        )}
      </span>
      <span className="text-lg font-semibold text-foreground tabular-nums">{children}</span>
    </div>
  );
}

function AgentReportVisitorFrequencyModal({ open, agent, data, isLoading, errorText, onClose }) {
  const buckets = data?.buckets || [];
  const totals = data?.totals || {};
  const chartData = buckets.map(bucket => ({
    bucket: bucket.label || `${bucket.sessionsPerVisitor}`,
    visitors: toNumber(bucket.visitors) ?? 0,
    converted: toNumber(bucket.actionTakeConversionPct),
  }));

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent className="gap-5 sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Visitor frequency: how often visitors return, and who converts</DialogTitle>
          <DialogDescription>
            Visitors are grouped by sessions per visitor (1–9 and 10+). {CONVERSION_HELP_TEXT}
          </DialogDescription>
        </DialogHeader>

        {agent && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13.5px]">
            <dt className="text-muted-foreground">Agent</dt>
            <dd className="min-w-0 truncate text-foreground">
              {agent.agentName ? `${agent.agentName} (${agent.agentId})` : agent.agentId}
            </dd>
            <dt className="text-muted-foreground">Dates</dt>
            <dd className="text-foreground tabular-nums">
              {formatDisplayDate(agent.startDate)} – {formatDisplayDate(agent.endDate)}
            </dd>
          </dl>
        )}

        {isLoading && (
          <div className="flex flex-col gap-3" aria-hidden>
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-[280px] rounded-lg" />
          </div>
        )}

        {!isLoading && errorText && (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertTitle className="line-clamp-none">{errorText}</AlertTitle>
          </Alert>
        )}

        {!isLoading && !errorText && data && (
          <>
            <div className="grid grid-cols-1 divide-y overflow-hidden rounded-lg bg-muted/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <Stat label="Visitors (people)">{formatCount(toNumber(totals.visitors))}</Stat>
              <Stat label="Sessions">{formatCount(toNumber(totals.sessions))}</Stat>
              <Stat label="Converted" help={CONVERSION_HELP_TEXT}>
                {formatCount(toNumber(totals.visitorsWithActionTake))}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  ({formatPct(totals.actionTakeConversionPct)})
                </span>
              </Stat>
            </div>
            {chartData.length ? (
              <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    label={{
                      value: 'Sessions per visitor',
                      position: 'insideBottom',
                      offset: -2,
                      className: 'fill-muted-foreground text-xs',
                    }}
                    height={40}
                  />
                  <YAxis yAxisId="visitors" tickLine={false} axisLine={false} width={44} />
                  <YAxis
                    yAxisId="converted"
                    orientation="right"
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={value => `${value}%`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <span className="flex w-full justify-between gap-4">
                            <span className="text-muted-foreground">
                              {chartConfig[name]?.label}
                            </span>
                            <span className="font-medium text-foreground tabular-nums">
                              {name === 'converted' ? formatPct(value) : formatCount(value)}
                            </span>
                          </span>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    yAxisId="visitors"
                    dataKey="visitors"
                    fill="var(--color-visitors)"
                    radius={[4, 4, 0, 0]}
                    {...chartAnimation}
                  />
                  <Line
                    yAxisId="converted"
                    dataKey="converted"
                    type="monotone"
                    stroke="var(--color-converted)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                    {...chartAnimation}
                  />
                </ComposedChart>
              </ChartContainer>
            ) : (
              <Alert className="rounded-lg border-0 bg-muted/70 *:[svg]:text-muted-foreground">
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
                <AlertTitle>No visitors in this period.</AlertTitle>
              </Alert>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AgentReportVisitorFrequencyModal;
