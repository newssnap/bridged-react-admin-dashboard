import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconSwap } from '@/components/icon-swap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/*
 * Icon button that copies `value` to the clipboard and shows a check for `timeout` ms.
 *
 * <CopyButton value={text} />
 * <CopyButton value={() => buildText()} labels={['Copy all', 'Copied']} />
 *
 * `value` is a string or a (sync or async) function returning one. `labels` are the
 * tooltip / accessible labels before and after copying. Any Button props pass through
 * (`variant`, `size`, `className`, ...); children replace the default label-less content
 * and are rendered after the icon.
 */

export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the legacy path (e.g. insecure context or denied permission).
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

function CopyButton({
  value,
  labels = ['Copy', 'Copied'],
  timeout = 2000,
  onCopy,
  variant = 'ghost',
  size,
  className,
  children,
  onClick,
  tooltip = true,
  ...props
}) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef(null);

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = async event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.stopPropagation();
    const text = typeof value === 'function' ? await value() : value;
    await copyToClipboard(String(text ?? ''));
    setCopied(true);
    onCopy?.(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), timeout);
  };

  const label = copied ? labels[1] : labels[0];
  const button = (
    <Button
      type="button"
      data-slot="copy-button"
      data-copied={copied || undefined}
      variant={variant}
      size={size ?? (children ? 'sm' : 'icon-sm')}
      aria-label={children ? undefined : label}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      <IconSwap swapKey={copied ? 'copied' : 'copy'}>
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          strokeWidth={2}
          data-icon={children ? 'inline-start' : undefined}
          className={cn(copied && 'text-success')}
        />
      </IconSwap>
      {children}
    </Button>
  );

  if (!tooltip) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { CopyButton };
