import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  GridViewIcon,
  LeftToRightListBulletIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { NumberValue } from '@/components/animated-number';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

/**
 * Page building blocks of the Bridged design system:
 * - PageHeader: the band at the top of a page (Qweek Site): 30px headline, a quieter lead line,
 *   actions on the right (at most one primary), optional `tabs` (a PageTabs) along its bottom edge. It runs edge to edge over the page padding and
 *   ends in a hairline, so it must be the first block of the page.
 * - PageSection: a titled block inside a page (16px title, quiet line, optional action).
 * - PageToolbar: the filter row under the header, the same order on every page:
 *     ViewToggle · quick switch (SegmentedControl) · other filters
 *     — PageToolbarSpacer —  result count · ToolbarSearch · toolbar actions (e.g. Download)
 *   The page's primary action (Create …) lives in the PageHeader, not the toolbar.
 * - ViewToggle / ToolbarSearch: the list/cards switch and the search field of a PageToolbar.
 * - StatStrip / StatCell: headline numbers in one strip divided by hairlines.
 * - PageTabs: tabs under a page header with a sliding underline.
 * - Panel / PanelEmpty: a titled section with a hairline ring and a "See all" link.
 * - PageEmpty: the designed "nothing here yet" state of a page.
 * - SegmentedControl: icon or text options with a sliding pill (view toggles).
 * Modelled on Qweek Site (modules/shell, modules/overview).
 */

/**
 * A line shown above the next PageHeader's title in this subtree (e.g. which event an agent
 * page belongs to), for pages whose header is drawn by a shared component. A PageHeader's own
 * `eyebrow` prop wins.
 */
const PageHeaderEyebrowContext = React.createContext(null);

function PageHeaderEyebrow({ children, value }) {
  return (
    <PageHeaderEyebrowContext.Provider value={value}>{children}</PageHeaderEyebrowContext.Provider>
  );
}

function PageHeader({ title, description, actions, tabs, eyebrow, children, className, ...props }) {
  const contextEyebrow = React.useContext(PageHeaderEyebrowContext);
  const eyebrowNode = eyebrow ?? contextEyebrow;
  return (
    <header
      data-slot="page-header"
      className={cn(
        'flex flex-col border-b',
        '-mx-(--page-gutter) -mt-(--page-gutter) p-(--page-gutter)',
        tabs && 'pb-0 md:pb-0',
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-1">
          {eyebrowNode}
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance text-foreground md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-base text-pretty text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {actions && (
          <div
            data-slot="page-header-actions"
            className="flex shrink-0 flex-wrap items-center gap-2"
          >
            {actions}
          </div>
        )}
      </div>
      {tabs && <div className="mt-6">{tabs}</div>}
    </header>
  );
}

function PageSection({ title, description, action, children, className, ...props }) {
  return (
    <section data-slot="page-section" className={cn('flex flex-col gap-4', className)} {...props}>
      {(title || description || action) && (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-[13.5px] text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

function PageToolbar({ className, ...props }) {
  return (
    <div
      data-slot="page-toolbar"
      className={cn('flex flex-wrap items-center gap-2.5', className)}
      {...props}
    />
  );
}

/** Pushes what follows to the end of a PageToolbar (result count, search, actions). */
function PageToolbarSpacer({ className }) {
  return <div aria-hidden className={cn('ms-auto', className)} />;
}

const VIEW_TOGGLE_OPTIONS = [
  { value: 'list', label: 'List', icon: LeftToRightListBulletIcon },
  { value: 'kanban', label: 'Cards', icon: GridViewIcon },
];

/** The list / cards switch; always the first control of a PageToolbar. Values: 'list' | 'kanban'. */
function ViewToggle({ value, onValueChange, layoutId = 'view-toggle', className }) {
  return (
    <SegmentedControl
      options={VIEW_TOGGLE_OPTIONS}
      value={value}
      onValueChange={onValueChange}
      layoutId={layoutId}
      label="View"
      iconOnly
      className={className}
    />
  );
}

/** The search field of a PageToolbar; sits after the spacer, before any toolbar actions. */
function ToolbarSearch({ value, onChange, placeholder = 'Search', className, ...props }) {
  return (
    <InputGroup className={cn('w-full sm:w-64', className)}>
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={event => onChange?.(event.target.value)}
        {...props}
      />
    </InputGroup>
  );
}

/** Headline numbers in one strip. `flush` drops the card look to run edge to edge. */
function StatStrip({ flush = false, className, ...props }) {
  return (
    <div
      data-slot="stat-strip"
      className={cn(
        'grid grid-cols-1 divide-y divide-border sm:auto-cols-fr sm:grid-flow-col sm:divide-x sm:divide-y-0',
        flush
          ? 'border-y border-border'
          : 'overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10',
        className
      )}
      {...props}
    />
  );
}

function StatCell({ label, icon, value, hint, loading = false, className, children }) {
  return (
    <div data-slot="stat-cell" className={cn('flex min-w-0 flex-col gap-1.5 px-6 py-5', className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      {loading ? (
        <div className="h-6 w-24 animate-pulse rounded-lg bg-muted sm:h-[30px]" />
      ) : (
        <div className="text-2xl leading-none font-semibold tracking-tight text-foreground tabular-nums animate-in fade-in-0 duration-300 ease-out-quad sm:text-3xl">
          {/* Rolls up from zero when the stat first appears. */}
          <NumberValue value={value} countUp />
        </div>
      )}
      {hint && <div className="hidden text-xs text-muted-foreground sm:block">{hint}</div>}
      {children}
    </div>
  );
}

const TAB_SPRING = { type: 'spring', duration: 0.35, bounce: 0 };

/**
 * Tabs under a page header (Qweek Site's module tabs): text tabs with an optional
 * count, and an underline that slides to the selected one. Controlled: pass `value`
 * and `onValueChange`. `layoutId` must be unique per mounted copy.
 */
function PageTabs({ tabs, value, onValueChange, layoutId = 'page-tabs', label, className }) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'flex [scrollbar-width:none] gap-6 overflow-x-auto text-sm [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      {tabs.map(tab => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onValueChange?.(tab.value)}
            className={cn(
              'relative shrink-0 rounded-sm pb-3 whitespace-nowrap transition-colors duration-150 ease-out-quad outline-none focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
              selected
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ms-1.5 text-muted-foreground tabular-nums">
                <NumberValue value={tab.count} />
              </span>
            )}
            {selected && (
              <motion.span
                layoutId={layoutId}
                transition={reduceMotion ? { duration: 0 } : TAB_SPRING}
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A titled block of a page (Qweek Site's Panel): a hairline ring, a heading with an
 * optional count, and a "See all" link (`more`) or anything else beside it (`aside`).
 * Lists run edge to edge; give text padding with `bodyClassName`.
 */
function Panel({
  title,
  count,
  description,
  more,
  aside,
  className,
  bodyClassName,
  children,
  ...props
}) {
  const titleId = React.useId();
  return (
    <section
      data-slot="panel"
      aria-labelledby={titleId}
      className={cn(
        'flex h-full min-w-0 flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-4.5">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
            {count != null && (
              <span className="ms-1.5 font-normal text-muted-foreground tabular-nums">
                <NumberValue value={count} />
              </span>
            )}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {aside ??
          (more && (
            <Link
              to={more.to}
              className="-me-2 inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out-quad outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {more.label}
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Link>
          ))}
      </div>
      <div className={cn('flex-1 pt-3 pb-2', bodyClassName)}>{children}</div>
    </section>
  );
}

/** A quiet line inside a Panel when it has nothing to show. */
function PanelEmpty({ children }) {
  return <p className="px-5 pt-1 pb-4 text-sm text-muted-foreground">{children}</p>;
}

/** The designed "nothing here yet" state of a page (Qweek Site's ModuleEmpty). */
function PageEmpty({ icon, title, description, children, className }) {
  return (
    <Empty className={cn('rounded-lg border border-dashed bg-muted/30 py-16', className)}>
      <EmptyHeader>
        {icon && (
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={icon} strokeWidth={2} />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}

const PILL_SPRING = { type: 'spring', duration: 0.3, bounce: 0 };

/**
 * A few options with a pill that slides to the selected one (Qweek Site's view
 * toggle and status switch). Options: { value, label, icon? }; with `iconOnly` the
 * label becomes the accessible name. `layoutId` must be unique per mounted copy.
 */
function SegmentedControl({
  options,
  value,
  onValueChange,
  layoutId = 'segmented',
  iconOnly = false,
  label,
  className,
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex w-fit shrink-0 rounded-full bg-muted p-1', className)}
    >
      {options.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            onClick={() => onValueChange?.(option.value)}
            className={cn(
              'relative flex h-7 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-out-quad outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              iconOnly ? 'w-7' : 'px-3',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
                style={{ borderRadius: 9999 }}
                className="absolute inset-0 bg-background shadow-sm ring-1 ring-foreground/5 dark:bg-input/60"
              />
            )}
            {option.icon && (
              <HugeiconsIcon icon={option.icon} strokeWidth={2} className="relative size-4" />
            )}
            {!iconOnly && <span className="relative">{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export {
  PageHeader,
  PageHeaderEyebrow,
  PageSection,
  PageToolbar,
  PageToolbarSpacer,
  ViewToggle,
  ToolbarSearch,
  StatStrip,
  StatCell,
  PageTabs,
  Panel,
  PanelEmpty,
  PageEmpty,
  SegmentedControl,
};
