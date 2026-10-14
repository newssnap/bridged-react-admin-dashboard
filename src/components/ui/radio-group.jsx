import * as React from 'react';
import { cn } from 'cn';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
function RadioGroup({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-3', className)}
      {...props}
    />
  );
}
function RadioGroupItem({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-transparent bg-input/90 transition-[background-color,border-color,box-shadow,scale] duration-150 ease-out-quad outline-none motion-safe:active:scale-90 group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="absolute inset-0 flex items-center justify-center data-[state=checked]:animate-in data-[state=checked]:fade-in-0 data-[state=checked]:zoom-in-50 data-[state=checked]:duration-200 data-[state=checked]:ease-out-expo data-[state=unchecked]:animate-out data-[state=unchecked]:fade-out-0 data-[state=unchecked]:zoom-out-50 data-[state=unchecked]:duration-100 data-[state=unchecked]:ease-out-quad motion-reduce:zoom-in-100 motion-reduce:zoom-out-100"
      >
        <span className="size-2 rounded-full bg-primary-foreground dark:size-2.5" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}


export { RadioGroup, RadioGroupItem };
