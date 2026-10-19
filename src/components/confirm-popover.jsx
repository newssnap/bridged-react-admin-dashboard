import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';

const isThenable = value => !!value && typeof value.then === 'function';
const isRenderable = node => node !== undefined && node !== null && node !== false && node !== '';

/**
 * Inline confirmation in a popover, anchored to its single child (the trigger, via `asChild`).
 *
 * - `onConfirm(event)` gets the confirm button's click event. A returned promise keeps the
 *   popover open with a loading confirm button until it settles (closes on resolve, stays open
 *   on reject); any other return value closes it.
 * - `onCancel(event)` gets the cancel button's click event, after the popover is asked to close.
 * - `open` / `onOpenChange(open, event?)` for controlled use (`defaultOpen` otherwise). Confirm,
 *   cancel, trigger clicks, outside presses and Esc all go through `onOpenChange`.
 * - `disabled` ignores every open / close request coming from the trigger, outside presses or Esc.
 * - `icon` defaults to a warning icon; `null` / `false` hides it. `className` goes on the panel.
 */
function ConfirmPopover({
  title,
  description,
  icon,
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  showCancel = true,
  onConfirm,
  onCancel,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  side = 'top',
  align = 'center',
  sideOffset,
  className,
  children,
}) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp !== undefined ? !!openProp : innerOpen;
  const [loading, setLoading] = React.useState(false);
  const pendingRef = React.useRef(false);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setOpen = (next, event) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next, event);
  };

  const handleOpenChange = next => {
    if (disabled) return;
    setOpen(next);
  };

  const handleConfirm = event => {
    if (pendingRef.current) return;
    const result = onConfirm?.(event);
    if (!isThenable(result)) {
      setOpen(false, event);
      return;
    }
    pendingRef.current = true;
    setLoading(true);
    result.then(
      () => {
        pendingRef.current = false;
        if (!mountedRef.current) return;
        setLoading(false);
        setOpen(false);
      },
      () => {
        pendingRef.current = false;
        if (mountedRef.current) setLoading(false);
      }
    );
  };

  const handleCancel = event => {
    setOpen(false, event);
    onCancel?.(event);
  };

  const iconNode =
    icon === undefined ? <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} /> : icon;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn('w-auto max-w-xs gap-3', className)}
      >
        <div className="flex items-start gap-2.5">
          {iconNode ? (
            <span className="mt-0.5 flex shrink-0 text-warning [&_svg:not([class*='size-'])]:size-4">
              {iconNode}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1">
            {isRenderable(title) ? <PopoverTitle className="text-sm">{title}</PopoverTitle> : null}
            {isRenderable(description) ? (
              <div data-slot="popover-description" className="text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {showCancel ? (
            <Button size="sm" variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
          ) : null}
          <Button size="sm" variant={confirmVariant} disabled={loading} onClick={handleConfirm}>
            {loading ? <Spinner data-icon="inline-start" /> : null}
            {confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { ConfirmPopover };
