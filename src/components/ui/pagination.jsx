import * as React from 'react';
import { cn } from 'cn';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreHorizontalCircle01Icon,
} from '@hugeicons/core-free-icons';
// Lets the active-page indicator slide between links of the same pagination.
const PaginationContext = React.createContext(null);
function Pagination({ className, ...props }) {
  const indicatorId = React.useId();
  return (
    <PaginationContext.Provider value={indicatorId}>
      <nav
        role="navigation"
        aria-label="pagination"
        data-slot="pagination"
        className={cn('mx-auto flex w-full justify-center', className)}
        {...props}
      />
    </PaginationContext.Provider>
  );
}
function PaginationContent({ className, ...props }) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}
function PaginationItem({ ...props }) {
  return <li data-slot="pagination-item" {...props} />;
}
function PaginationLink({ className, isActive, size = 'icon', children, ...props }) {
  const indicatorId = React.useContext(PaginationContext);
  const reduceMotion = useReducedMotion();
  return (
    <Button
      asChild
      variant={isActive && !indicatorId ? 'outline' : 'ghost'}
      size={size}
      className={cn('relative isolate', className)}
    >
      <a
        aria-current={isActive ? 'page' : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      >
        {children}
        {isActive && indicatorId && (
          <motion.span
            aria-hidden
            data-slot="pagination-indicator"
            layoutId={indicatorId}
            transition={
              reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.25, bounce: 0 }
            }
            className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] border border-border bg-background dark:bg-transparent"
          />
        )}
      </a>
    </Button>
  );
}
function PaginationPrevious({ className, text = 'Previous', ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('ps-2!', className)}
      {...props}
    >
      <HugeiconsIcon
        icon={ArrowLeft01Icon}
        strokeWidth={2}
        data-icon="inline-start"
        className="rtl:rotate-180"
      />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}
function PaginationNext({ className, text = 'Next', ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('pe-2!', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        strokeWidth={2}
        data-icon="inline-end"
        className="rtl:rotate-180"
      />
    </PaginationLink>
  );
}
function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
      <span className="sr-only">More pages</span>
    </span>
  );
}
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
