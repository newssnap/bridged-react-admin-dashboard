import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The ChartTooltipContent look (src/components/ui/chart.jsx) for the SVG charts that are
 * not recharts-based (Funnel, WordCloud). Follows the pointer inside the chart container.
 */
export function TooltipBox({ title, items, x, y, containerWidth, visible }) {
  const flip = x > containerWidth / 2;
  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 left-0 z-10 transition-opacity duration-150 ease-out-quad',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ transform: `translate(${x + (flip ? -12 : 12)}px, ${y + 12}px)` }}
    >
      <div
        className={cn(
          'grid min-w-32 items-start gap-1.5 rounded-lg bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10',
          flip && '-translate-x-full'
        )}
      >
        {title !== null && title !== undefined && title !== '' && (
          <div className="font-medium">{String(title)}</div>
        )}
        <div className="grid gap-1.5">
          {items.map((item, index) => (
            <div key={index} className="flex w-full items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                <span className="text-muted-foreground">{item.name}</span>
                {item.value !== null && item.value !== undefined && (
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {typeof item.value === 'number'
                      ? item.value.toLocaleString()
                      : String(item.value)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
