import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// The icon tile takes the dialog's tone; a destructive confirm is solid so the final,
// irreversible step reads as the main action.
const MEDIA_TONE = {
  destructive: 'bg-destructive/10 text-destructive',
  default: 'bg-primary/10 text-primary',
};
const SOLID_DESTRUCTIVE =
  'bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90';

const isThenable = value => !!value && typeof value.then === 'function';

/**
 * Confirmation dialog on the shadcn AlertDialog.
 *
 * - `onConfirm(event)`: a returned promise keeps the dialog open with a loading confirm button
 *   until it settles (closes on resolve, stays open on reject); any other return value closes it.
 * - Every other close request (Cancel, Esc) calls `onCancel()`. The overlay never closes it.
 * - `icon`: defaults to a warning icon; `null` / `false` hides it.
 * - Controlled with `open` / `onOpenChange`, or uncontrolled with an optional trigger child.
 */
function ConfirmDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  showCancel = true,
  onConfirm,
  onCancel,
  onCloseAutoFocus,
  className,
  children,
}) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const open = openProp !== undefined ? openProp : innerOpen;
  const [loading, setLoading] = React.useState(false);
  const pendingRef = React.useRef(false);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setOpen = next => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const handleOpenChange = next => {
    if (!next) onCancel?.();
    setOpen(next);
  };

  const handleConfirm = event => {
    if (pendingRef.current) return;
    const result = onConfirm?.(event);
    if (!isThenable(result)) {
      setOpen(false);
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

  const iconNode =
    icon === undefined ? <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} /> : icon;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      <AlertDialogContent
        className={className}
        onCloseAutoFocus={onCloseAutoFocus}
        {...(description ? null : { 'aria-describedby': undefined })}
      >
        <AlertDialogHeader>
          {iconNode ? (
            <AlertDialogMedia className={MEDIA_TONE[variant] ?? 'bg-muted text-foreground'}>
              {iconNode}
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription asChild>
              <div>{description}</div>
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel ? <AlertDialogCancel>{cancelText}</AlertDialogCancel> : null}
          <Button
            variant={variant}
            disabled={loading}
            onClick={handleConfirm}
            className={cn(variant === 'destructive' && SOLID_DESTRUCTIVE)}
          >
            {loading ? <Spinner data-icon="inline-start" /> : null}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Imperative API: `confirm(options)` renders a ConfirmDialog in its own root. */

let entries = [];
let nextId = 0;
const listeners = new Set();
let hostRoot = null;

const emit = () => listeners.forEach(listener => listener());
const subscribe = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => entries;

function setEntry(id, patch) {
  entries = entries.map(entry => (entry.id === id ? { ...entry, ...patch } : entry));
  emit();
}

function removeEntry(id) {
  entries = entries.filter(entry => entry.id !== id);
  emit();
}

function ConfirmDialogHost() {
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return items.map(({ id, open, options, returnFocus }) => (
    <ConfirmDialog
      key={id}
      {...options}
      open={open}
      onOpenChange={next => {
        if (!next) setEntry(id, { open: false });
      }}
      onCloseAutoFocus={event => {
        // No trigger to return to: restore focus to whatever had it before `confirm()`.
        event.preventDefault();
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
        removeEntry(id);
      }}
    />
  ));
}

function ensureHost() {
  if (hostRoot) return;
  const container = document.createElement('div');
  container.setAttribute('data-slot', 'confirm-dialog-host');
  document.body.appendChild(container);
  hostRoot = createRoot(container);
  hostRoot.render(<ConfirmDialogHost />);
}

/**
 * Opens a confirmation dialog from anywhere (event handlers, hooks, column renderers).
 * Takes the ConfirmDialog props: `title`, `description`, `confirmText`, `cancelText`,
 * `variant` ('default' | 'destructive'), `icon`, `showCancel`, `onConfirm`, `onCancel`.
 * Returns `{ close }` to dismiss it programmatically (without calling `onCancel`).
 */
function confirm(options = {}) {
  ensureHost();
  const id = nextId++;
  const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  entries = [...entries, { id, open: true, options, returnFocus }];
  emit();
  return { close: () => setEntry(id, { open: false }) };
}

export { ConfirmDialog, confirm };
