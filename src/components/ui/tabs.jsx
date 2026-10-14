import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import { motion, useReducedMotion } from 'motion/react';
import { Tabs as TabsPrimitive } from 'radix-ui';
// Tracks the active tab so the indicator can move between triggers.
const TabsContext = React.createContext(null);
const TabsListContext = React.createContext({ variant: 'default' });
function Tabs({
  className,
  orientation = 'horizontal',
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const activeValue = valueProp ?? uncontrolledValue;
  const indicatorId = React.useId();
  return (
    <TabsContext.Provider value={{ activeValue, indicatorId, orientation }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        value={activeValue}
        onValueChange={value => {
          setUncontrolledValue(value);
          onValueChange?.(value);
        }}
        className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}
const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-full p-1 text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-lg data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
function TabsList({ className, variant = 'default', ...props }) {
  return (
    <TabsListContext.Provider value={{ variant: variant ?? 'default' }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsListContext.Provider>
  );
}
function TabsTrigger({ className, children, value, ...props }) {
  const tabs = React.useContext(TabsContext);
  const { variant } = React.useContext(TabsListContext);
  const reduceMotion = useReducedMotion();
  const isActive = tabs?.activeValue === value;
  const vertical = tabs?.orientation === 'vertical';
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative isolate inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-2 rounded-full border border-transparent! px-3 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors duration-200 ease-out-quad group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:rounded-md group-data-vertical/tabs:px-3 group-data-vertical/tabs:py-1.5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'data-active:text-foreground dark:data-active:text-foreground',
        className
      )}
      {...props}
    >
      {children}
      {isActive && tabs && (
        <motion.span
          aria-hidden
          data-slot="tabs-indicator"
          layoutId={tabs.indicatorId}
          transition={
            reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.25, bounce: 0 }
          }
          // Inline radius lets Motion correct corner distortion while it scales.
          style={{
            borderRadius: variant === 'line' ? 0 : vertical ? 8 : 9999,
          }}
          className={cn(
            'pointer-events-none absolute -z-10',
            variant === 'line'
              ? vertical
                ? 'inset-y-0 -end-1 w-0.5 bg-foreground'
                : 'inset-x-0 -bottom-[5px] h-0.5 bg-foreground'
              : 'inset-0 bg-background dark:border dark:border-input dark:bg-input/30'
          )}
        />
      )}
    </TabsPrimitive.Trigger>
  );
}
function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 text-sm outline-none data-active:animate-in data-active:fade-in-0 data-active:duration-150 data-active:ease-out-quad',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
