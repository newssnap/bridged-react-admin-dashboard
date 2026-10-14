import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/*
 * Count / dot indicator, optionally pinned to the top-end corner of its children.
 * (Text labels and status pills are `Badge` from ui/badge.)
 *
 * <CountBadge count={activeFilters} size="sm"><Button …/></CountBadge>
 * <CountBadge count={items} overflowCount={999} showZero variant="secondary" />
 * <CountBadge dot={hasNews}>{label}</CountBadge>
 *
 * Display rules:
 * - `count` above `overflowCount` (99) shows `${overflowCount}+`.
 * - 0 (or '0') is hidden unless `showZero`; null / undefined / '' is hidden.
 * - `dot` shows a dot instead of the number, unless the count is 0.
 * - `offset={[x, y]}` moves a pinned indicator x px outwards (end) and y px down.
 */

const countBadgeVariants = cva(
  'z-10 inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap tabular-nums shadow-[0_0_0_1px_var(--background)]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive text-white',
      },
      size: {
        default: 'h-[18px] min-w-[18px] px-1 text-xs',
        sm: 'h-3.5 min-w-3.5 px-1 text-[10px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const isZeroValue = value => value === 0 || value === '0';
const isEmptyValue = value =>
  value === null || value === undefined || value === '' || value === false;

/** What the indicator shows: `{ hidden, dot, display }`. */
export function getCountBadgeState({ count, overflowCount = 99, showZero = false, dot = false }) {
  const display = typeof count === 'number' && count > overflowCount ? `${overflowCount}+` : count;
  const zero = isZeroValue(display);
  const showAsDot = !!dot && !zero;
  const hidden = !showAsDot && (isEmptyValue(display) || (zero && !showZero));
  return { hidden, dot: showAsDot, display: showAsDot ? null : display };
}

function CountBadge({
  count = null,
  overflowCount = 99,
  showZero = false,
  dot = false,
  offset,
  variant,
  size,
  title,
  className,
  indicatorClassName,
  indicatorStyle,
  children,
  ...props
}) {
  const state = getCountBadgeState({ count, overflowCount, showZero, dot });
  const pinned = children !== undefined && children !== null && children !== false;

  if (state.hidden && !pinned) return null;

  const indicator = state.hidden ? null : (
    <span
      data-slot="count-badge-indicator"
      data-dot={state.dot || undefined}
      title={
        title ??
        (typeof count === 'string' || typeof count === 'number' ? String(count) : undefined)
      }
      {...(pinned ? null : props)}
      className={cn(
        countBadgeVariants({ variant, size }),
        state.dot && 'size-1.5 min-w-1.5 p-0',
        pinned
          ? 'absolute top-0 end-0 translate-x-1/2 -translate-y-1/2 rtl:-translate-x-1/2'
          : className,
        indicatorClassName
      )}
      style={
        offset
          ? {
              marginTop: offset[1],
              insetInlineEnd: -Number.parseInt(offset[0], 10),
              ...indicatorStyle,
            }
          : indicatorStyle
      }
    >
      {state.display}
    </span>
  );

  if (!pinned) return indicator;

  return (
    <span
      data-slot="count-badge"
      className={cn('relative inline-flex w-fit', className)}
      {...props}
    >
      {children}
      {indicator}
    </span>
  );
}

export { CountBadge, countBadgeVariants };
