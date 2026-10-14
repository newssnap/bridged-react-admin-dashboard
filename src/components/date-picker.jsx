import * as React from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

/**
 * shadcn Date Picker (Popover + Calendar + trigger button) working on dayjs values.
 *
 * Values in and out are dayjs objects (or null). A picked day is applied to the current value
 * with dayjs setters, so time of day, UTC mode and `.tz()` zones carry over unchanged.
 *
 * DatePicker: `value`, `onValueChange(date | null, dateString)`, `format` (dayjs format),
 * `showTime` + `timeFormat` ('HH:mm' | 'HH:mm:ss'), `disabledDate(current)`,
 * `disabledTime(current) => ({ disabledHours, disabledMinutes, disabledSeconds })`,
 * `allowClear` (default true), `placeholder`, `disabled`, `open` / `onOpenChange`,
 * `content` (replaces the calendar, e.g. an explanation panel), `className` (trigger).
 *
 * DateRangePicker: `value` ([start, end] | null), `onValueChange(dates | null, strings)`,
 * `format`, `presets` ([{ label, value: [start, end] }]), `disabledDate`, `placeholder`
 * ([start, end]), `allowClear`, `disabled`, `open` / `onOpenChange`, `className`.
 */

const DATE_FORMAT = 'YYYY-MM-DD';
const pad = n => String(n).padStart(2, '0');

/** Calendar day (local Date) for a dayjs value, read from its own wall clock. */
const toCalendarDate = value =>
  value ? new Date(value.year(), value.month(), value.date()) : undefined;

/** Apply a calendar day to a dayjs base without touching its time or zone. */
const withDay = (base, day) =>
  base.date(1).year(day.getFullYear()).month(day.getMonth()).date(day.getDate());

const isValid = value => Boolean(value && typeof value.isValid === 'function' && value.isValid());

const triggerClassName =
  'flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-transparent bg-input/50 px-3 text-start text-sm transition-[color,box-shadow,background-color,border-color] duration-150 ease-out-quad outline-none hover:bg-input/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/30';

function useOpenState(open, onOpenChange) {
  const [inner, setInner] = React.useState(false);
  const isControlled = open !== undefined;
  const mergedOpen = isControlled ? open : inner;
  const setOpen = next => {
    if (!isControlled) setInner(next);
    onOpenChange?.(next);
  };
  return [mergedOpen, setOpen];
}

function ClearButton({ onClear }) {
  return (
    <span
      role="button"
      tabIndex={-1}
      aria-label="Clear"
      onPointerDown={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onClear();
      }}
      className="ms-auto flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 ease-out-quad hover:text-foreground"
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
    </span>
  );
}

function TimeColumn({ label, count, selected, isDisabled, onSelect }) {
  const listRef = React.useRef(null);
  React.useEffect(() => {
    const node = listRef.current?.querySelector('[data-selected=true]');
    if (node && listRef.current) listRef.current.scrollTop = node.offsetTop;
  }, [selected]);
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      className="no-scrollbar flex h-full w-12 flex-col gap-0.5 overflow-y-auto p-1"
    >
      {Array.from({ length: count }, (_, unit) => {
        const disabled = isDisabled?.(unit) ?? false;
        return (
          <button
            key={unit}
            type="button"
            role="option"
            aria-selected={selected === unit}
            data-selected={selected === unit}
            disabled={disabled}
            onClick={() => onSelect(unit)}
            className="shrink-0 rounded-md py-1.5 text-center text-sm tabular-nums transition-colors duration-150 ease-out-quad hover:bg-muted disabled:pointer-events-none disabled:opacity-40 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
          >
            {pad(unit)}
          </button>
        );
      })}
    </div>
  );
}

function DatePicker({
  value,
  onValueChange,
  format,
  showTime = false,
  timeFormat = 'HH:mm:ss',
  placeholder = 'Select date',
  disabled = false,
  disabledDate,
  disabledTime,
  allowClear = true,
  open,
  onOpenChange,
  content,
  align = 'start',
  className,
  ...props
}) {
  const current = isValid(value) ? value : null;
  const mergedFormat = format || (showTime ? `${DATE_FORMAT} ${timeFormat}` : DATE_FORMAT);
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  const [draft, setDraft] = React.useState(current);
  const [month, setMonth] = React.useState(() => toCalendarDate(current) ?? new Date());

  const handleOpenChange = next => {
    if (disabled) return;
    if (next) {
      setDraft(current);
      setMonth(toCalendarDate(current) ?? new Date());
    }
    setOpen(next);
  };

  const emit = next => {
    onValueChange?.(next, next ? next.format(mergedFormat) : '');
  };

  const handleDayClick = day => {
    if (showTime) {
      setDraft(withDay(draft ?? current ?? dayjs(), day));
      return;
    }
    const next = withDay(current ?? dayjs(), day);
    if (!current || !next.isSame(current)) emit(next);
    setOpen(false);
  };

  const shown = showTime ? draft : current;
  const timeLimits = showTime && disabledTime ? disabledTime(shown) || {} : {};
  const setTimePart = (unit, amount) => setDraft((draft ?? current ?? dayjs())[unit](amount));

  return (
    <Popover open={isOpen && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-picker-trigger"
          data-empty={!current}
          disabled={disabled}
          className={cn(triggerClassName, className)}
          {...props}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className={cn('truncate', !current && 'text-muted-foreground')}>
            {current ? current.format(mergedFormat) : placeholder}
          </span>
          {allowClear && current && !disabled && <ClearButton onClear={() => emit(null)} />}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto gap-0 overflow-hidden p-0">
        {content ?? (
          <>
            <div className="flex">
              <Calendar
                mode="single"
                selected={toCalendarDate(shown)}
                onDayClick={(day, modifiers) => {
                  if (!modifiers.disabled) handleDayClick(day);
                }}
                month={month}
                onMonthChange={setMonth}
                disabled={
                  disabledDate ? day => !!disabledDate(withDay(shown ?? dayjs(), day)) : undefined
                }
              />
              {showTime && (
                <div className="flex h-[19rem] border-s border-foreground/5">
                  <TimeColumn
                    label="Hours"
                    count={24}
                    selected={shown?.hour()}
                    isDisabled={unit => timeLimits.disabledHours?.()?.includes(unit)}
                    onSelect={unit => setTimePart('hour', unit)}
                  />
                  {timeFormat.includes('m') && (
                    <TimeColumn
                      label="Minutes"
                      count={60}
                      selected={shown?.minute()}
                      isDisabled={unit =>
                        timeLimits.disabledMinutes?.(shown?.hour())?.includes(unit)
                      }
                      onSelect={unit => setTimePart('minute', unit)}
                    />
                  )}
                  {timeFormat.includes('s') && (
                    <TimeColumn
                      label="Seconds"
                      count={60}
                      selected={shown?.second()}
                      isDisabled={unit =>
                        timeLimits.disabledSeconds?.(shown?.hour(), shown?.minute())?.includes(unit)
                      }
                      onSelect={unit => setTimePart('second', unit)}
                    />
                  )}
                </div>
              )}
            </div>
            {showTime && (
              <>
                <Separator />
                <div className="flex items-center justify-between gap-2 p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      emit(dayjs());
                      setOpen(false);
                    }}
                  >
                    Now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!draft}
                    onClick={() => {
                      if (draft && (!current || !draft.isSame(current))) emit(draft);
                      setOpen(false);
                    }}
                  >
                    OK
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function DateRangePicker({
  value,
  onValueChange,
  format = DATE_FORMAT,
  presets,
  placeholder = ['Start date', 'End date'],
  disabled = false,
  disabledDate,
  allowClear = true,
  open,
  onOpenChange,
  align = 'start',
  className,
  ...props
}) {
  const start = isValid(value?.[0]) ? value[0] : null;
  const end = isValid(value?.[1]) ? value[1] : null;
  const hasValue = Boolean(start && end);
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  const [pendingStart, setPendingStart] = React.useState(null);
  const [month, setMonth] = React.useState(() => toCalendarDate(start) ?? new Date());

  const emit = dates => {
    onValueChange?.(dates, dates ? dates.map(d => d.format(format)) : ['', '']);
  };

  const handleOpenChange = next => {
    if (disabled) return;
    if (next) {
      setPendingStart(null);
      setMonth(toCalendarDate(start) ?? new Date());
    }
    setOpen(next);
  };

  const handleDayClick = day => {
    if (!pendingStart) {
      setPendingStart(withDay(start ?? dayjs(), day));
      return;
    }
    const picked = withDay(end ?? dayjs(), day);
    const dates = picked.isBefore(pendingStart) ? [picked, pendingStart] : [pendingStart, picked];
    setPendingStart(null);
    emit(dates);
    setOpen(false);
  };

  const selected = pendingStart
    ? { from: toCalendarDate(pendingStart), to: undefined }
    : hasValue
      ? { from: toCalendarDate(start), to: toCalendarDate(end) }
      : undefined;

  return (
    <Popover open={isOpen && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-range-picker-trigger"
          data-empty={!hasValue}
          disabled={disabled}
          className={cn(triggerClassName, className)}
          {...props}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className={cn('truncate', !start && 'text-muted-foreground')}>
            {start ? start.format(format) : placeholder[0]}
          </span>
          <span className="text-muted-foreground">–</span>
          <span className={cn('truncate', !end && 'text-muted-foreground')}>
            {end ? end.format(format) : placeholder[1]}
          </span>
          {allowClear && hasValue && !disabled && <ClearButton onClear={() => emit(null)} />}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto flex-row gap-0 overflow-hidden p-0">
        {presets?.length > 0 && (
          <div className="flex flex-col gap-0.5 border-e border-foreground/5 p-2">
            {presets.map(preset => (
              <Button
                key={preset.label}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  emit(preset.value);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onDayClick={(day, modifiers) => {
            if (!modifiers.disabled) handleDayClick(day);
          }}
          month={month}
          onMonthChange={setMonth}
          disabled={
            disabledDate ? day => !!disabledDate(withDay(start ?? dayjs(), day)) : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, DateRangePicker };
