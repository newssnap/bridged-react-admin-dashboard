import * as React from 'react';
import { cn } from 'cn';
import { Switch as SwitchPrimitive } from 'radix-ui';
function Switch({ className, size = 'default', ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-250 ease-out-quad outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-11 data-[size=sm]:h-4 data-[size=sm]:w-7 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary group-has-[:focus-visible]/field-label:data-checked:border-primary data-unchecked:border-transparent data-unchecked:bg-input/90 group-has-[:focus-visible]/field-label:data-unchecked:border-transparent data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-[translate,width,background-color] duration-250 ease-drawer not-dark:bg-clip-padding group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-6 group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-4 motion-reduce:transition-colors dark:data-checked:bg-primary-foreground data-unchecked:translate-x-0 rtl:data-unchecked:-translate-x-0 dark:data-unchecked:bg-foreground',
          // Pin the checked thumb to the track's end (inner width minus its own
          // width) so it stays flush while it stretches under the pointer.
          'group-data-[size=default]/switch:data-checked:translate-x-[calc(40px-100%)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(24px-100%)] rtl:group-data-[size=default]/switch:data-checked:-translate-x-[calc(40px-100%)] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(24px-100%)]',
          'motion-safe:group-active/switch:group-data-[size=default]/switch:w-7 motion-safe:group-active/switch:group-data-[size=sm]/switch:w-5'
        )}
      />
    </SwitchPrimitive.Root>
  );
}


export { Switch };
