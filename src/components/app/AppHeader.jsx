import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, SidebarLeftIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getCrumbs } from '@/constants/navigation/navConfig';

/** Breadcrumb trail for the current route, read from the admin nav config (display only). */
function useCrumbs() {
  const { pathname } = useLocation();
  return React.useMemo(() => getCrumbs(pathname), [pathname]);
}

function AppBreadcrumbs() {
  const crumbs = useCrumbs();
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="min-w-0 flex-nowrap gap-1 text-[0.8rem] sm:gap-1.5 sm:text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          // Phones keep just the page; the trail above it is in the sidebar.
          const phoneHidden = !last && 'max-sm:hidden';
          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem className={cn(last ? 'min-w-0' : 'shrink-0', phoneHidden)}>
                {last ? (
                  <BreadcrumbPage className="truncate font-medium">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator className={cn('shrink-0', phoneHidden)} />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * App header: sticky, translucent, 56px. Sidebar toggle (a menu button that opens the
 * sidebar sheet on phones), breadcrumbs, then the app's action buttons on the right.
 */
export default function AppHeader({
  collapsed,
  onToggleSidebar,
  showToggle = true,
  mobile = false,
  actions,
  className,
}) {
  const toggleLabel = mobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <TooltipProvider>
      <header
        data-slot="app-header"
        className={cn(
          'app-header sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl backdrop-saturate-150 md:rounded-t-2xl md:px-5',
          className
        )}
      >
        {showToggle && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-ms-1"
                  aria-label={toggleLabel}
                  onClick={onToggleSidebar}
                >
                  <HugeiconsIcon icon={mobile ? Menu01Icon : SidebarLeftIcon} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{toggleLabel}</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="me-1 h-4 self-center!" />
          </>
        )}
        <AppBreadcrumbs />
        <div className="ms-auto flex shrink-0 items-center gap-1">{actions}</div>
      </header>
    </TooltipProvider>
  );
}
