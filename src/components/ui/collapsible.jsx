import { cn } from 'cn';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
function Collapsible({ ...props }) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}
function CollapsibleTrigger({ ...props }) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}
function CollapsibleContent({ className, ...props }) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden [--disclosure-height:var(--radix-collapsible-content-height)] data-open:animate-disclosure-down data-closed:animate-disclosure-up',
        className
      )}
      {...props}
    />
  );
}


export { Collapsible, CollapsibleTrigger, CollapsibleContent };
