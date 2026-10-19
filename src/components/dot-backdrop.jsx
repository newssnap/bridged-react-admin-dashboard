import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * A dotted texture for the top of a card (the same dot grid as an empty ScreenThumbnail),
 * fading out toward the content. On hover of the surrounding `group/card` the dots take
 * the brand colour.
 *
 * <Card className="relative isolate overflow-hidden">   // Card already carries group/card
 *   <DotBackdrop className="h-24" />
 *   ...
 * </Card>
 *
 * `fade` is 'down' (a band along the top edge) or 'corner' (a glow from the top-right).
 * `active` keeps the brand colour on (e.g. a selected card).
 */

const FADE_MASKS = {
  down: 'linear-gradient(to bottom, #000 0%, transparent 100%)',
  corner: 'radial-gradient(120% 100% at 100% 0%, #000 0%, transparent 70%)',
};

const DOT_LAYER = 'absolute inset-0 bg-[size:14px_14px]';

function DotBackdrop({ fade = 'down', active = false, className }) {
  const mask = FADE_MASKS[fade] || FADE_MASKS.down;
  return (
    <div
      aria-hidden
      data-slot="dot-backdrop"
      className={cn('pointer-events-none absolute inset-x-0 top-0 -z-10', className)}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <div
        className={cn(
          DOT_LAYER,
          'bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_20%,transparent)_1px,transparent_1px)]'
        )}
      />
      <div
        className={cn(
          DOT_LAYER,
          'bg-[radial-gradient(color-mix(in_oklab,var(--primary)_55%,transparent)_1px,transparent_1px)] opacity-0 transition-opacity duration-300 ease-out-quad group-hover/card:opacity-100 group-focus-visible/card:opacity-100',
          active && 'opacity-100'
        )}
      />
    </div>
  );
}

export { DotBackdrop };
