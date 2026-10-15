import React from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChartBarLineIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldGroup } from '@/components/ui/field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { DateRangePicker } from '@/components/date-picker';
import { MultiSelect } from '@/components/multi-select';
import { Form, FormField } from '@/components/form';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  {
    value: 'customer',
    label: 'Customer facing report',
    description: 'Views, engagement and conversions per agent, for the period and all time.',
    icon: UserGroupIcon,
  },
  {
    value: 'productivity',
    label: 'Productivity usage report',
    description: 'Usage of each productivity agent per domain, with daily averages.',
    icon: ChartBarLineIcon,
  },
];

const datePresets = () => [
  { label: 'Today', value: [dayjs(), dayjs()] },
  { label: 'Past 7 days', value: [dayjs().subtract(7, 'days'), dayjs()] },
  { label: 'Past 30 days', value: [dayjs().subtract(30, 'days'), dayjs()] },
  { label: 'This month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
];

/** Report types as checkbox cards; the value is the array of picked types. */
function ReportTypeChoices({ value = [], onValueChange, id, 'aria-describedby': describedBy }) {
  const toggle = (type, checked) =>
    onValueChange?.(checked ? [...new Set([...value, type])] : value.filter(v => v !== type));

  return (
    <div id={id} role="group" aria-describedby={describedBy} className="flex flex-col gap-2.5">
      {REPORT_TYPES.map(type => {
        const checked = value.includes(type.value);
        const checkboxId = `${id || 'report-type'}-${type.value}`;
        return (
          <label
            key={type.value}
            htmlFor={checkboxId}
            className={cn(
              'flex cursor-pointer items-start gap-3.5 rounded-lg bg-card p-3.5 ring-1 ring-foreground/10 transition-[background-color,box-shadow] duration-150 ease-out-quad hover:bg-muted/50 has-focus-visible:ring-2 has-focus-visible:ring-ring/50',
              checked && 'bg-primary/[0.05] ring-2 ring-primary hover:bg-primary/[0.05]'
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-md transition-colors duration-150',
                checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              <HugeiconsIcon icon={type.icon} strokeWidth={2} className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{type.label}</span>
              <span className="text-[13px] text-pretty text-muted-foreground">
                {type.description}
              </span>
            </span>
            <Checkbox
              id={checkboxId}
              checked={checked}
              onCheckedChange={next => toggle(type.value, next === true)}
              className="mt-0.5 shrink-0"
            />
          </label>
        );
      })}
    </div>
  );
}
ReportTypeChoices.formBinding = 'valueChange';

/**
 * Exports reports for one user: pick the report types, the domains (productivity report only)
 * and a date range. The user's token and domains are loaded before the drawer opens.
 */
function ExportReportDrawer({
  open,
  onClose,
  form,
  onGenerate,
  isGenerating,
  selectedReportTypes,
  onReportTypesChange,
  userDomains,
}) {
  const needsDomains = selectedReportTypes.includes('productivity');
  const domainOptions = (userDomains || []).map(domain => ({
    label: domain.host,
    value: domain.host,
  }));

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        onOpenAutoFocus={event => event.preventDefault()}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]"
      >
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            Export report
          </SheetTitle>
          <SheetDescription>Download this user’s reports as Excel files.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form form={form} onFinish={onGenerate} autoComplete="off" requiredMark={false}>
            <FieldGroup>
              <FormField
                name="reportTypes"
                label="Reports"
                rules={[{ required: true, message: 'Pick at least one report' }]}
              >
                <ReportTypeChoices onValueChange={onReportTypesChange} />
              </FormField>

              <FormField
                name="domain"
                label="Domains"
                bind="valueChange"
                description={
                  needsDomains
                    ? 'The productivity report covers these domains.'
                    : 'Only used by the productivity usage report.'
                }
                rules={[
                  {
                    required: needsDomains,
                    message: 'Pick a domain for the productivity usage report',
                  },
                ]}
              >
                <MultiSelect
                  options={domainOptions}
                  placeholder={domainOptions.length ? 'Pick domains' : 'No domains found'}
                  emptyText="No domains found."
                  disabled={!needsDomains}
                  allowClear
                />
              </FormField>

              <FormField
                name="dateRange"
                label="Date range"
                bind="valueChange"
                rules={[{ required: true, message: 'Pick a date range' }]}
              >
                <DateRangePicker
                  className="w-full"
                  placeholder={['Start date', 'End date']}
                  presets={datePresets()}
                />
              </FormField>
            </FieldGroup>
          </Form>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button type="button" onClick={() => form.submit()} disabled={isGenerating}>
            {isGenerating && <Spinner data-icon="inline-start" />}
            {isGenerating ? 'Generating…' : 'Generate report'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default ExportReportDrawer;
