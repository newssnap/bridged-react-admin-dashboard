import React from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, AlertCircleIcon, Delete02Icon } from '@hugeicons/core-free-icons';
import { DateRangePicker } from '@/components/date-picker';
import { SegmentedControl } from '@/components/page-header';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AGENT_REPORT_MAX_CAMPAIGNS,
  AGENT_REPORT_TYPES,
  AGENT_REPORT_TYPE_OPTIONS,
} from '../../../constants/agentReportTypes';

const disableFutureDates = current => current && current.isAfter(dayjs(), 'day');
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

const labelClass = 'text-sm font-medium text-foreground';
const hintClass = 'text-xs text-muted-foreground';

function AgentReportForm({ form, onGenerate, isSubmitting, submitError }) {
  const {
    agentType,
    setAgentType,
    rows,
    addRow,
    canAddRow,
    removeRow,
    updateRow,
    pasteText,
    setPasteText,
    pastedIdCount,
    addPastedIds,
    pasteNotice,
    bulkRange,
    setBulkRange,
    applyBulkRangeToAll,
    rowErrors,
    formError,
  } = form;
  const typeLayoutId = `report-type-${React.useId()}`;

  return (
    <section
      aria-labelledby="new-report-title"
      className="flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10"
    >
      <div className="border-b px-5 py-4">
        <h2 id="new-report-title" className="text-base font-semibold text-foreground">
          New report
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Pick an agent type, add agents with their dates, then generate.
        </p>
      </div>

      <div className="flex flex-col divide-y">
        {/* Agent type */}
        <div className="flex flex-col gap-2 px-5 py-4">
          <span className={labelClass}>Agent type</span>
          <SegmentedControl
            label="Agent type"
            layoutId={typeLayoutId}
            options={AGENT_REPORT_TYPE_OPTIONS}
            value={agentType}
            onValueChange={setAgentType}
            className="max-w-full overflow-x-auto [scrollbar-width:none] *:shrink-0 *:whitespace-nowrap"
          />
          <p className={hintClass}>{AGENT_REPORT_TYPES[agentType]?.description}</p>
        </div>

        {/* Bulk helpers */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-5 py-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="report-paste-ids" className={labelClass}>
              Paste many agent IDs
            </label>
            <Textarea
              id="report-paste-ids"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="One ID per line (commas and spaces also work)"
              className="max-h-40 min-h-20"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={addPastedIds} disabled={!pastedIdCount}>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                {pastedIdCount ? `Add ${plural(pastedIdCount, 'ID', 'IDs')}` : 'Add rows'}
              </Button>
              {pasteNotice && <p className={hintClass}>{pasteNotice}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className={labelClass}>Same dates for every agent</span>
            <DateRangePicker
              value={bulkRange}
              onValueChange={setBulkRange}
              disabledDate={disableFutureDates}
              format="D MMM YYYY"
              className="w-full"
            />
            <p className={hintClass}>Pasted and new rows use these dates.</p>
            <div>
              <Button
                variant="outline"
                onClick={applyBulkRangeToAll}
                disabled={!bulkRange?.[0] || !bulkRange?.[1]}
              >
                Apply these dates to all rows
              </Button>
            </div>
          </div>
        </div>

        {/* Agent rows */}
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className={labelClass}>Agents</span>
            <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              {rows.length} of {AGENT_REPORT_MAX_CAMPAIGNS} max · duplicates removed
            </span>
          </div>
          <ul className="-me-2 flex max-h-[420px] flex-col gap-2 overflow-y-auto pe-2">
            {rows.map((row, index) => {
              const errors = rowErrors[row.key];
              const agentError = errors?.some(error => /agent/i.test(error));
              const dateError = errors?.some(error => /date/i.test(error));
              return (
                <li key={row.key} className="flex flex-col gap-1">
                  <div className="grid grid-cols-[1fr_auto] gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <Input
                      value={row.agentId}
                      aria-invalid={agentError || undefined}
                      onChange={e => updateRow(row.key, { agentId: e.target.value })}
                      placeholder="Agent ID (24 characters)"
                      aria-label={`Agent ID for row ${index + 1}`}
                      className="col-span-2 font-mono text-[13px] md:col-span-1"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <DateRangePicker
                      value={row.range}
                      onValueChange={range => updateRow(row.key, { range })}
                      disabledDate={disableFutureDates}
                      format="D MMM YYYY"
                      aria-invalid={dateError || undefined}
                      className={cn('w-full', dateError && 'ring-3 ring-destructive/20')}
                      aria-label={`Date range for row ${index + 1}`}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex" tabIndex={rows.length === 1 ? 0 : undefined}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
                            onClick={() => removeRow(row.key)}
                            disabled={rows.length === 1}
                            aria-label={`Remove row ${index + 1}`}
                          >
                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {rows.length === 1 ? 'A report needs at least one agent' : 'Remove row'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {errors && <p className="text-xs text-destructive">{errors.join(' · ')}</p>}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={addRow}
            disabled={!canAddRow}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out-quad outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-60"
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            {canAddRow ? 'Add agent' : `Limit of ${AGENT_REPORT_MAX_CAMPAIGNS} agents reached`}
          </button>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          {(formError || submitError) && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
              <AlertTitle className="line-clamp-none">{formError || submitError}</AlertTitle>
            </Alert>
          )}
          <div>
            <Button size="lg" onClick={onGenerate} disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? 'Generating…' : 'Generate report'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AgentReportForm;
