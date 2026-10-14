import * as React from 'react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/*
 * Small parts shared by the dashboard's list cards (agents, collections, screens, engines),
 * in the same language as the workflow selection cards: a raised icon tile over a
 * DotBackdrop band, and a stat strip in place of label/value rows.
 *
 * <Card className="relative isolate overflow-hidden">
 *   <DotBackdrop className="h-16 opacity-60" />
 *   <CardIconTile icon={AiBookIcon} />
 *   <CardStats>
 *     <CardStat label="Domain" icon={Globe02Icon}>example.com</CardStat>
 *     <CardStat label="Placement">Inline</CardStat>
 *   </CardStats>
 * </Card>
 */

/** The type icon on a quiet tile, so the card's band shows around it. */
function CardIconTile({ icon, className }) {
  return (
    <span
      aria-hidden
      data-slot="card-icon-tile"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-md bg-card text-primary ring-1 ring-foreground/[0.08]',
        className
      )}
    >
      {icon ? <HugeiconsIcon icon={icon} strokeWidth={1.75} className="size-[18px]" /> : null}
    </span>
  );
}

/** A row of stats in one tinted well, split by hairlines. Columns follow the number of stats. */
function CardStats({ className, children }) {
  const count = React.Children.toArray(children).filter(Boolean).length;
  if (!count) return null;
  return (
    <div
      data-slot="card-stats"
      className={cn(
        'grid divide-x divide-foreground/[0.06] rounded-md bg-muted/40 rtl:divide-x-reverse',
        count === 1 && 'grid-cols-1',
        count === 2 && 'grid-cols-2',
        count >= 3 && 'grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

/** One stat: a quiet label (with an optional icon) above its value. */
function CardStat({ label, icon, className, children }) {
  return (
    <div data-slot="card-stat" className={cn('flex min-w-0 flex-col gap-0.5 px-3 py-2', className)}>
      <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
        {icon ? <HugeiconsIcon icon={icon} strokeWidth={2} className="size-3.5 shrink-0" /> : null}
        <span className="truncate">{label}</span>
      </span>
      <div className="flex min-h-5 min-w-0 items-center text-[13px] font-medium text-foreground">
        {children}
      </div>
    </div>
  );
}

/** Loading stand-in for a list card's content: icon tile, title, stat strip and footer. */
function ListCardSkeletonBody({ icon = true, stats = 2, className }) {
  return (
    <div className={cn('flex h-full flex-col gap-4', className)}>
      {icon && (
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-[30%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
      <div
        className={cn(
          'grid gap-3 rounded-md bg-muted/40 px-3 py-2',
          stats > 1 ? 'grid-cols-2' : 'grid-cols-1'
        )}
      >
        {Array.from({ length: stats }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-[55%]" />
            <Skeleton className="h-3.5 w-[75%]" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/** The round check in a selection card's corner: filled when picked, a faint tick on hover. */
function CardSelectCheck({ selected, className }) {
  return (
    <span
      aria-hidden
      data-slot="card-select-check"
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-150 ease-out-quad',
        selected
          ? 'bg-primary text-primary-foreground ring-primary'
          : 'bg-card text-transparent ring-foreground/20 group-hover/card:text-muted-foreground',
        className
      )}
    >
      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-3" />
    </span>
  );
}

/**
 * Classes for a picker card (collections, engines, screens in agent create/edit):
 * the list card's surface, a brand ring when selected, dimmed when it can't be picked.
 * No overflow-hidden: in the pickers' fixed-height scrolling grids it would let rows shrink
 * below the content. Clip a DotBackdrop on its own with SELECT_CARD_BACKDROP instead.
 */
function selectCardClasses({ selectable = false, selected = false, blocked = false } = {}) {
  return cn(
    'group/card relative isolate flex h-full w-full flex-col rounded-lg bg-card ring-1 ring-foreground/10 transition-[box-shadow,background-color] duration-150 ease-out-quad outline-none',
    selectable &&
      !blocked &&
      'cursor-pointer hover:shadow-sm hover:ring-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/30',
    selectable && blocked && 'cursor-not-allowed',
    selected && 'bg-primary/[0.03] ring-2 ring-primary hover:ring-primary'
  );
}

/** DotBackdrop classes for a picker card: a short band, clipped to the card's rounded top. */
const SELECT_CARD_BACKDROP = 'h-14 overflow-hidden rounded-t-[inherit] opacity-60';

/** Classes for the list card itself: hairline ring that firms up, a soft lift on hover. */
const LIST_CARD_CLASSES =
  'relative isolate h-full w-full gap-0 overflow-hidden py-0 transition-[box-shadow] duration-200 ease-out-quad';
const LIST_CARD_INTERACTIVE_CLASSES =
  'cursor-pointer outline-none hover:shadow-sm hover:ring-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/30';

export {
  CardIconTile,
  CardSelectCheck,
  selectCardClasses,
  SELECT_CARD_BACKDROP,
  CardStats,
  CardStat,
  ListCardSkeletonBody,
  LIST_CARD_CLASSES,
  LIST_CARD_INTERACTIVE_CLASSES,
};
