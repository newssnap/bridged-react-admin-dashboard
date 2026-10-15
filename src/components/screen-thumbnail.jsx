import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

/**
 * A screen's screenshot (engagement, CTA, end screen) in the shared 1024 × 745 frame
 * (`aspect-screen`). Screenshots are normalised to that size when published, so they
 * fill the frame exactly; older ones in another ratio are cropped from the top, where
 * the screen's heading is. Without a screenshot (drafts, or one that fails to load)
 * it shows a quiet placeholder with the screen type's icon.
 */
function ScreenThumbnail({
  src,
  alt = '',
  icon = Image01Icon,
  placeholder = 'No preview yet',
  className,
  imageClassName,
  children,
}) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  const hasImage = Boolean(src) && !failed;

  return (
    <div
      data-slot="screen-thumbnail"
      className={cn(
        'relative isolate aspect-screen w-full overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5',
        className
      )}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            'absolute inset-0 size-full max-h-none object-cover object-top',
            imageClassName
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[radial-gradient(var(--dot)_0.75px,transparent_0.75px)] [background-size:14px_14px] text-muted-foreground [--dot:color-mix(in_oklab,var(--foreground)_14%,transparent)]">
          <span className="flex size-10 items-center justify-center rounded-md bg-background text-foreground/70 shadow-pill ring-1 ring-foreground/5">
            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
          </span>
          {placeholder && <span className="text-xs font-medium">{placeholder}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export { ScreenThumbnail };
