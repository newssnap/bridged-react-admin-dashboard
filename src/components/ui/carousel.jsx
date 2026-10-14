import * as React from 'react';
import { cn } from 'cn';
import { useReducedMotion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
const CarouselContext = React.createContext(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}
// How far a slide one position away shrinks and fades.
const DEPTH_SCALE = 0.08;
const DEPTH_OPACITY = 0.5;
function useEmblaValue(api, read, fallback) {
  const subscribe = React.useCallback(
    onChange => {
      if (!api) return () => {};
      api.on('select', onChange).on('reInit', onChange);
      return () => {
        api.off('select', onChange).off('reInit', onChange);
      };
    },
    [api]
  );
  return React.useSyncExternalStore(
    subscribe,
    () => (api ? read(api) : fallback),
    () => fallback
  );
}
// Scales and fades each slide by its distance from the snap point. Driven by
// Embla's scroll progress, so it tracks drags 1:1 and stays interruptible.
function useSlideDepth(api, enabled) {
  React.useEffect(() => {
    if (!api) return;
    const nodes = () => api.slideNodes().map(slide => slide.firstElementChild);
    if (!enabled) {
      nodes().forEach(node => node?.style.removeProperty('transform'));
      nodes().forEach(node => node?.style.removeProperty('opacity'));
      return;
    }
    const apply = () => {
      const engine = api.internalEngine();
      const progress = api.scrollProgress();
      const snaps = api.scrollSnapList();
      const slides = nodes();
      snaps.forEach((snap, snapIndex) => {
        engine.slideRegistry[snapIndex].forEach(slideIndex => {
          let diff = snap - progress;
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach(point => {
              const target = point.target();
              if (slideIndex !== point.index || target === 0) return;
              diff = Math.sign(target) === -1 ? snap - (1 + progress) : snap + (1 - progress);
            });
          }
          const distance = Math.min(Math.abs(diff * snaps.length), 1);
          const node = slides[slideIndex];
          if (!node) return;
          node.style.transform = `scale(${1 - distance * DEPTH_SCALE})`;
          node.style.opacity = `${1 - distance * DEPTH_OPACITY}`;
        });
      });
    };
    apply();
    api.on('scroll', apply).on('reInit', apply).on('slideFocus', apply);
    return () => {
      api.off('scroll', apply).off('reInit', apply).off('slideFocus', apply);
    };
  }, [api, enabled]);
}
function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  depth = true,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      // A touch longer than Embla's default so button-driven slides glide.
      duration: 30,
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const reduceMotion = useReducedMotion();
  const canScrollPrev = useEmblaValue(api, api => api.canScrollPrev(), false);
  const canScrollNext = useEmblaValue(api, api => api.canScrollNext(), false);
  const selectedIndex = useEmblaValue(api, api => api.selectedScrollSnap(), 0);
  const snapCount = useEmblaValue(api, api => api.scrollSnapList().length, 0);
  useSlideDepth(api, depth && !reduceMotion);
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);
  const handleKeyDown = React.useCallback(
    event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );
  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);
  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        snapCount,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}
function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div
        className={cn('flex', orientation === 'horizontal' ? '-ms-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  );
}
function CarouselItem({ className, children, ...props }) {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'ps-4' : 'pt-4',
        className
      )}
      {...props}
    >
      {/* Depth styles are written here so Embla's slide measurements stay untouched. */}
      <div data-slot="carousel-item-inner" className="h-full">
        {children}
      </div>
    </div>
  );
}
function CarouselPrevious({ className, variant = 'outline', size = 'icon-sm', ...props }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        'absolute touch-manipulation rounded-full',
        orientation === 'horizontal'
          ? 'inset-y-0 -start-12 my-auto'
          : 'start-1/2 -top-12 -translate-x-1/2 rotate-90 rtl:translate-x-1/2',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="rtl:rotate-180" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}
function CarouselNext({ className, variant = 'outline', size = 'icon-sm', ...props }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        'absolute touch-manipulation rounded-full',
        orientation === 'horizontal'
          ? 'inset-y-0 -end-12 my-auto'
          : 'start-1/2 -bottom-12 -translate-x-1/2 rotate-90 rtl:translate-x-1/2',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="rtl:rotate-180" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}
function CarouselDots({ className, ...props }) {
  const { api, selectedIndex, snapCount } = useCarousel();
  if (snapCount < 2) return null;
  return (
    <div
      data-slot="carousel-dots"
      className={cn('flex items-center justify-center gap-1.5', className)}
      {...props}
    >
      {Array.from({ length: snapCount }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex}
          data-active={index === selectedIndex}
          onClick={() => api?.scrollTo(index)}
          className="relative h-1.5 w-1.5 rounded-full bg-foreground/20 transition-[width,background-color] duration-300 ease-out-expo outline-none after:absolute after:-inset-2 hover:bg-foreground/40 focus-visible:ring-3 focus-visible:ring-ring/30 data-[active=true]:w-5 data-[active=true]:bg-foreground motion-reduce:transition-colors"
        />
      ))}
    </div>
  );
}


export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  useCarousel,
};
