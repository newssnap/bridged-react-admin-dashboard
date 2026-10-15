import * as React from 'react';
import { cn } from 'cn';
import { motion, useReducedMotion } from 'motion/react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { toggleVariants } from '@/components/ui/toggle';
const ToggleGroupContext = React.createContext({
  size: 'default',
  variant: 'default',
  spacing: 2,
  orientation: 'horizontal',
});
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = 'horizontal',
  children,
  ...props
}) {
  const single = props.type === 'single' ? props : null;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(single?.defaultValue ?? '');
  const activeValue = single ? (single.value ?? uncontrolledValue) : undefined;
  const indicatorId = React.useId();
  const rootProps = single
    ? {
        ...single,
        value: activeValue,
        onValueChange: value => {
          setUncontrolledValue(value);
          single.onValueChange?.(value);
        },
      }
    : props;
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing }}
      className={cn(
        'group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-[spacing=0]:data-[variant=outline]:rounded-3xl data-vertical:flex-col data-vertical:items-stretch',
        className
      )}
      {...rootProps}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          orientation,
          activeValue,
          indicatorId: single ? indicatorId : undefined,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}
function ToggleGroupItem({ className, children, variant = 'default', size = 'default', ...props }) {
  const context = React.useContext(ToggleGroupContext);
  const reduceMotion = useReducedMotion();
  const hasIndicator = Boolean(context.indicatorId);
  const isActive = hasIndicator && context.activeValue === props.value;
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-indicator={hasIndicator}
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        'shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-3 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pe-2.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:ps-2.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-3xl group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-3xl group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-3xl group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-3xl data-[state=on]:bg-muted group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t',
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        // The sliding indicator draws the selected background instead.
        'relative isolate data-[indicator=true]:data-[state=on]:bg-transparent',
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.span
          aria-hidden
          data-slot="toggle-group-indicator"
          layoutId={context.indicatorId}
          transition={
            reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.25, bounce: 0 }
          }
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-muted"
        />
      )}
    </ToggleGroupPrimitive.Item>
  );
}


export { ToggleGroup, ToggleGroupItem };
