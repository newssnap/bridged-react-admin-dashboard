import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Setting rows for the team drawers, copied from the dashboard's SettingRow / SettingGroup
 * (presentation/agents/create/reusable/components). Icon, title and a quiet hint on the left,
 * the control on the right. `panel` holds the nested options; `panelOpen={false}` keeps them
 * mounted but hidden (so their form values stay registered while the switch is off).
 */
function SettingRow({
  icon,
  title,
  description,
  control,
  className,
  children,
  panel,
  panelOpen = true,
  inline = false,
}) {
  return (
    <div
      data-slot="setting-row"
      className={cn(
        'flex flex-col gap-3 rounded-lg bg-muted/60 px-4 py-3.5',
        'in-data-[slot=setting-group]:rounded-none in-data-[slot=setting-group]:bg-transparent',
        // Flat (drawer) groups: hairline-split rows, but the section heading's gap and the
        // section padding already frame the group, so its outer rows don't add their own.
        'in-data-[flat=true]:in-data-[slot=setting-group]:py-3.5',
        'in-data-[flat=true]:in-data-[slot=setting-group]:first:pt-0!',
        'in-data-[flat=true]:in-data-[slot=setting-group]:last:pb-0!',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-x-4 gap-y-2',
          inline ? 'flex-nowrap' : 'flex-wrap'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3',
            inline ? 'min-w-22 flex-1' : 'min-w-0 flex-1 basis-56'
          )}
        >
          {icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {title ? <div className="text-sm font-medium text-foreground">{title}</div> : null}
            {description ? (
              <div className="text-[13px] leading-snug text-pretty text-muted-foreground">
                {description}
              </div>
            ) : null}
            {children}
          </div>
        </div>
        {control ? (
          <div
            className={cn(
              'flex items-center gap-2',
              inline ? 'min-w-0 shrink justify-end' : 'shrink-0'
            )}
          >
            {control}
          </div>
        ) : null}
      </div>
      {panel ? (
        <div
          hidden={!panelOpen}
          className={cn(
            'flex flex-col gap-5 rounded-md bg-muted/50 p-4',
            panelOpen ? 'reveal-in' : 'hidden',
            icon && 'sm:ms-12'
          )}
        >
          {panel}
        </div>
      ) : null}
    </div>
  );
}

/**
 * One card of related SettingRows split by hairlines. Inside a `data-flat="true"` container
 * (drawer bodies) it drops the card and runs edge to edge.
 */
function SettingGroup({ className, card = false, ...props }) {
  return (
    <div
      data-slot="setting-group"
      data-card={card || undefined}
      className={cn(
        'flex shrink-0 flex-col divide-y divide-border overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10',
        !card && [
          'in-data-[flat=true]:-mx-(--flat-gutter) in-data-[flat=true]:w-auto! in-data-[flat=true]:self-stretch in-data-[flat=true]:overflow-visible in-data-[flat=true]:rounded-none in-data-[flat=true]:bg-transparent in-data-[flat=true]:ring-0',
          'in-data-[flat=true]:[&>*]:px-(--flat-gutter)!',
          'in-data-[flat=true]:[[data-slot=setting-group]:not([data-card])+&]:-mt-px in-data-[flat=true]:[[data-slot=setting-group]:not([data-card])+&]:border-t',
        ],
        className
      )}
      {...props}
    />
  );
}

function SettingGroupLabel({ className, children, ...props }) {
  return (
    <div
      data-slot="setting-group-label"
      className={cn(
        'bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground',
        'in-data-[flat=true]:border-b-0! in-data-[flat=true]:bg-transparent in-data-[flat=true]:pt-5 in-data-[flat=true]:pb-0 in-data-[flat=true]:text-xs in-data-[flat=true]:font-semibold in-data-[flat=true]:tracking-[0.02em] in-data-[flat=true]:text-muted-foreground in-data-[flat=true]:uppercase',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A flat drawer section: a small heading (and optional action) above its content. Consecutive
 * sections are split by a full-width hairline (the body sets `--flat-gutter`).
 */
function DrawerSection({ title, description, action, className, children, ...props }) {
  const headingId = React.useId();
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        '-mx-(--flat-gutter) flex flex-col gap-4 border-t px-(--flat-gutter) py-6',
        'first:border-t-0 first:pt-2',
        className
      )}
      {...props}
    >
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title ? (
              <h3 id={headingId} className="text-sm font-semibold text-foreground">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="text-[13px] text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export { SettingRow, SettingGroup, SettingGroupLabel, DrawerSection };
