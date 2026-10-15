import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { IconSwap } from '@/components/icon-swap';

/*
 * Stepper: numbered indicators joined by rails.
 *
 * <Steps current={1} items={[{ title: 'Details' }, { title: 'Connect', description: '…' }]} />
 *
 * - Each item's status is `item.status`, else derived from its position: before `current` is
 *   'finish', at `current` is the `status` prop ('process' by default, or 'error' / 'finish' /
 *   'wait'), after is 'wait'. The step number shown is `initial + index + 1`.
 * - `onChange(next)` makes non-disabled steps clickable; it fires only when `next !== current`.
 * - `orientation` 'horizontal' | 'vertical'; with `responsive` (default) a horizontal stepper
 *   stacks vertically below the `sm` breakpoint.
 * - `size` 'default' | 'sm'.
 */

const SM_DOWN_QUERY = '(max-width: 639.98px)';

function useMediaQuery(query, enabled) {
  const subscribe = React.useCallback(
    onChange => {
      if (!enabled || typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener?.('change', onChange);
      return () => mql.removeEventListener?.('change', onChange);
    },
    [query, enabled]
  );
  return React.useSyncExternalStore(
    subscribe,
    () =>
      !!enabled &&
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia(query).matches,
    () => false
  );
}

const INDICATOR_TONE = {
  wait: 'bg-muted text-muted-foreground',
  process: 'bg-primary text-primary-foreground',
  finish: 'bg-primary/10 text-primary',
  error: 'bg-destructive/10 text-destructive',
};

const TITLE_TONE = {
  wait: 'text-muted-foreground',
  process: 'text-foreground',
  finish: 'text-foreground',
  error: 'text-destructive',
};

/** Status of every item, same rules as the stepper this replaces. */
export function getStepStatuses(items, { current = 0, initial = 0, status = 'process' } = {}) {
  return items.map((item, index) => {
    if (item?.status) return item.status;
    const stepNumber = initial + index;
    if (stepNumber === current) return status;
    if (stepNumber < current) return 'finish';
    return 'wait';
  });
}

function Steps({
  items = [],
  current = 0,
  initial = 0,
  status = 'process',
  onChange,
  size = 'default',
  orientation = 'horizontal',
  responsive = true,
  className,
  ...props
}) {
  const isSmDown = useMediaQuery(SM_DOWN_QUERY, responsive && orientation === 'horizontal');
  const vertical = orientation === 'vertical' || isSmDown;
  const small = size === 'sm';
  const steps = items.filter(Boolean);
  const statuses = getStepStatuses(steps, { current, initial, status });

  return (
    <ol
      data-slot="steps"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      data-size={size}
      className={cn(
        'flex w-full text-sm text-foreground',
        vertical ? 'flex-col' : 'flex-row items-start',
        className
      )}
      {...props}
    >
      {steps.map((item, index) => {
        const stepNumber = initial + index;
        const itemStatus = statuses[index] || 'wait';
        const last = index === steps.length - 1;
        const active = stepNumber === current;
        const clickable = !!onChange && !item.disabled;
        const Trigger = clickable ? 'button' : 'div';

        let indicatorContent = item.icon;
        if (!indicatorContent) {
          if (itemStatus === 'finish') {
            indicatorContent = (
              <HugeiconsIcon
                icon={Tick02Icon}
                strokeWidth={2.5}
                className={small ? 'size-3.5' : 'size-4'}
              />
            );
          } else if (itemStatus === 'error') {
            indicatorContent = (
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2.5}
                className={small ? 'size-3.5' : 'size-4'}
              />
            );
          } else {
            indicatorContent = <span className="tabular-nums">{stepNumber + 1}</span>;
          }
        }

        const rail = !last && (
          <div
            aria-hidden
            data-slot="step-separator"
            className={cn(
              'overflow-hidden bg-border',
              vertical
                ? cn(
                    'absolute bottom-1.5 w-px',
                    small
                      ? 'start-[calc(--spacing(3)-0.5px)] top-7.5'
                      : 'start-[calc(--spacing(4)-0.5px)] top-9.5'
                  )
                : cn('ms-3 h-px min-w-4 flex-1', small ? 'mt-3' : 'mt-4')
            )}
          >
            {/* Fills from the finished step toward the next one. */}
            <div
              className={cn(
                'size-full bg-primary/50 transition-transform duration-500 ease-out-expo motion-reduce:transition-none',
                vertical ? 'origin-top' : 'origin-left rtl:origin-right',
                itemStatus === 'finish' ? 'scale-100' : vertical ? 'scale-y-0' : 'scale-x-0'
              )}
            />
          </div>
        );

        return (
          <li
            key={item.key ?? stepNumber}
            data-slot="step"
            data-status={itemStatus}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'group/step relative flex min-w-0 items-start',
              vertical
                ? cn(!last && (small ? 'pb-3' : 'pb-4'))
                : cn(last ? 'flex-none' : 'flex-1', index > 0 && (small ? 'ps-3' : 'ps-4')),
              item.className
            )}
          >
            <Trigger
              {...(clickable
                ? {
                    type: 'button',
                    onClick: () => {
                      if (stepNumber !== current) onChange(stepNumber);
                    },
                  }
                : null)}
              data-slot="step-trigger"
              aria-disabled={(onChange && item.disabled) || undefined}
              className={cn(
                'flex min-w-0 items-start text-start outline-none',
                small ? 'gap-2' : 'gap-3',
                clickable &&
                  'cursor-pointer rounded-lg focus-visible:ring-3 focus-visible:ring-ring/30',
                item.disabled && onChange && 'cursor-not-allowed'
              )}
            >
              <span
                data-slot="step-indicator"
                className={cn(
                  'relative flex shrink-0 items-center justify-center rounded-full font-semibold transition-[background-color,color,box-shadow] duration-200 ease-out-quad',
                  small ? 'size-6 text-xs' : 'size-8 text-sm',
                  INDICATOR_TONE[itemStatus] || INDICATOR_TONE.wait,
                  clickable && 'group-hover/step:ring-3 group-hover/step:ring-ring/20'
                )}
              >
                {item.icon ? (
                  indicatorContent
                ) : (
                  <IconSwap
                    swapKey={
                      itemStatus === 'finish' || itemStatus === 'error' ? itemStatus : 'number'
                    }
                  >
                    {indicatorContent}
                  </IconSwap>
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  data-slot="step-title"
                  className={cn(
                    'font-medium whitespace-nowrap transition-colors duration-200 ease-out-quad',
                    small ? 'text-sm leading-6' : 'text-base leading-8',
                    TITLE_TONE[itemStatus] || TITLE_TONE.wait,
                    clickable && 'group-hover/step:text-primary'
                  )}
                >
                  {item.title}
                </span>
                {item.description != null && item.description !== false && (
                  <span
                    data-slot="step-description"
                    className={cn(
                      'text-sm',
                      itemStatus === 'error' ? 'text-destructive/80' : 'text-muted-foreground'
                    )}
                  >
                    {item.description}
                  </span>
                )}
              </span>
            </Trigger>
            {rail}
          </li>
        );
      })}
    </ol>
  );
}

export { Steps };
