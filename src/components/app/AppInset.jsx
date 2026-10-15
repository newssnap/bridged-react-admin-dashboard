import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Inset shell: the main area is a rounded card floating on the sidebar
 * colour. The page still scrolls on the window (existing scroll listeners and
 * antd Affix rely on that); `fill` pins it to the viewport for full-height tools.
 */
export default function AppInset({ fill = false, className, children }) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col md:p-2 md:ps-0', fill && 'h-dvh min-h-0')}>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col bg-background md:rounded-xl md:shadow-sm',
          fill ? 'min-h-0 overflow-hidden' : 'md:min-h-[calc(100svh-1rem)]',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
