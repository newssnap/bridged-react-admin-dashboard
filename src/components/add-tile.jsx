import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A dashed "add" tile that fills a grid slot (Qweek Site's "New listing" tile). Use it
 * instead of stretching a Button: Buttons stay pills. Takes the props of a <button>.
 */
function AddTile({ className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      data-slot="add-tile"
      className={cn(
        'flex size-full min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-foreground/15 bg-muted/30 p-6 text-center text-sm font-medium transition-[background-color,border-color,scale] duration-150 ease-out-quad outline-none hover:border-foreground/25 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100 [&_svg]:size-5 [&_svg]:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export { AddTile };
