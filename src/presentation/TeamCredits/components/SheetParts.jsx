import React, { useState } from 'react';
import { ConfirmPopover } from '@/components/confirm-popover';
import { Button } from '@/components/ui/button';
import { SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/** Sheet widths from the design system (§8). */
export const SHEET_WIDTH = {
  sm: 'data-[side=right]:sm:max-w-[400px]',
  md: 'data-[side=right]:sm:max-w-[600px]',
  lg: 'data-[side=right]:sm:max-w-[900px]',
};

export const sheetContentClasses = size =>
  cn('gap-0 data-[side=right]:w-full', SHEET_WIDTH[size] ?? SHEET_WIDTH.md);

/** Title + optional quiet line, over a hairline. */
export function CreditSheetHeader({ title, description }) {
  return (
    <SheetHeader className="border-b pe-14">
      <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">{title}</SheetTitle>
      {description ? (
        <SheetDescription className="text-[13.5px]">{description}</SheetDescription>
      ) : null}
    </SheetHeader>
  );
}

/** A flat, edge-to-edge block of a sheet body; consecutive sections split by a hairline. */
export function SheetSection({ title, description, aside, className, children }) {
  return (
    <section className={cn('flex flex-col gap-4 border-b px-6 py-5 last:border-b-0', className)}>
      {(title || aside) && (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Cancel for a sheet form: closes straight away when nothing changed, otherwise asks
 * "Discard changes?" first.
 */
export function DiscardButton({ form, onDiscard, disabled, children = 'Cancel' }) {
  const [open, setOpen] = useState(false);
  return (
    <ConfirmPopover
      open={open}
      onOpenChange={next => {
        if (next && !form?.isFieldsTouched?.()) {
          onDiscard();
          return;
        }
        setOpen(next);
      }}
      title="Discard changes?"
      description="What you entered won't be saved."
      confirmText="Discard"
      cancelText="Keep editing"
      confirmVariant="destructive"
      onConfirm={onDiscard}
      align="end"
    >
      <Button type="button" variant="outline" disabled={disabled}>
        {children}
      </Button>
    </ConfirmPopover>
  );
}
