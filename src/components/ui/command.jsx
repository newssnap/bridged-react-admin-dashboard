import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from 'cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon, Tick02Icon } from '@hugeicons/core-free-icons';
function Command({ className, ...props }) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex size-full flex-col overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground',
        className
      )}
      {...props}
    />
  );
}
function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  ...props
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {/* No open/close animation: a palette summoned many times a day (often
            from the keyboard) should appear and vanish instantly. */}
      <DialogContent
        className={cn(
          'top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0 animate-none!',
          className
        )}
        overlayClassName="animate-none!"
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
function CommandInput({ className, ...props }) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-9 bg-input/50">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            'w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
function CommandList({ className, ...props }) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'no-scrollbar h-(--cmdk-list-height) max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto transition-[height] duration-150 ease-out-quad outline-none motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  );
}
function CommandEmpty({ className, ...props }) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('py-6 text-center text-sm', className)}
      {...props}
    />
  );
}
// cmdk scrolls the selected item (and its group heading) into view on mount
// and on every selection change. For a Command rendered inline below the fold
// that scrolls the whole page on load, so only let it scroll while focus is
// inside this Command (keyboard navigation, or the ⌘K dialog's input).
function scrollOnlyWhileFocused(element) {
  if (!element) return;
  element.scrollIntoView = options => {
    const root = element.closest('[cmdk-root]');
    if (root?.contains(document.activeElement)) {
      HTMLElement.prototype.scrollIntoView.call(element, options);
    }
  };
}
function CommandGroup({ className, ref, ...props }) {
  const groupRef = React.useCallback(
    node => {
      scrollOnlyWhileFocused(node?.querySelector('[cmdk-group-heading]') ?? null);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  return (
    <CommandPrimitive.Group
      ref={groupRef}
      data-slot="command-group"
      className={cn(
        'overflow-hidden p-1.5 text-foreground **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
function CommandSeparator({ className, ...props }) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('my-1.5 h-px bg-border/50', className)}
      {...props}
    />
  );
}
function CommandItem({ className, children, ref, ...props }) {
  const itemRef = React.useCallback(
    node => {
      scrollOnlyWhileFocused(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  return (
    <CommandPrimitive.Item
      ref={itemRef}
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-hidden select-none in-data-[slot=dialog-content]:rounded-3xl data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={Tick02Icon}
        strokeWidth={2}
        className="ms-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
    </CommandPrimitive.Item>
  );
}
function CommandShortcut({ className, ...props }) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'ms-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground',
        className
      )}
      {...props}
    />
  );
}
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
