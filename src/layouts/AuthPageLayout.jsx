import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import AppHeader from '@/components/app/AppHeader';
import AppInset from '@/components/app/AppInset';
import ThemeToggle from '@/components/app/ThemeToggle';
import useGetWindowWidth from '../utils/controllers/useGetWindowWidth';
import { getValidOAuthRedirectFromSearch } from '../utils/controllers/oauthRedirect';
import CommandPalette from '../utils/components/commandPalette/CommandPalette';
import GlobalSidebar from './GlobalSidebar';

const DESKTOP_SIDEBAR_WIDTH = 248;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

function AuthPageLayout({ children, HeaderComp }) {
  const location = useLocation();
  const width = useGetWindowWidth();
  const isMobile = width <= MOBILE_BREAKPOINT;

  // Hide the sidebar only during a real Claude OAuth connect flow
  const isClaudeOAuthFlow = useMemo(
    () => Boolean(getValidOAuthRedirectFromSearch(location.search)),
    [location.search]
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );
  // Phones get the full sidebar in a slide-in sheet instead of a permanent rail.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  const sidebarWidth =
    isMobile || isClaudeOAuthFlow
      ? 0
      : sidebarCollapsed
        ? COLLAPSED_SIDEBAR_WIDTH
        : DESKTOP_SIDEBAR_WIDTH;

  return (
    <div className="flex min-h-screen w-full flex-auto bg-background">
      {!isClaudeOAuthFlow &&
        (isMobile ? (
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="w-[min(85vw,280px)] border-e-0 bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Admin pages</SheetDescription>
              <GlobalSidebar collapsed={false} />
            </SheetContent>
          </Sheet>
        ) : (
          <aside
            className="fixed inset-y-0 start-0 z-40 h-screen overflow-hidden bg-sidebar transition-[width] duration-200 ease-out-quad"
            style={{ width: sidebarWidth }}
          >
            <GlobalSidebar collapsed={sidebarCollapsed} />
          </aside>
        ))}

      <div
        className="flex min-h-screen w-0 min-w-0 flex-auto flex-col bg-sidebar transition-[margin] duration-200 ease-out-quad"
        style={{ marginInlineStart: sidebarWidth }}
      >
        <AppInset className={cn(isClaudeOAuthFlow && 'md:ms-2')}>
          {!isClaudeOAuthFlow && (
            <AppHeader
              collapsed={sidebarCollapsed}
              mobile={isMobile}
              onToggleSidebar={isMobile ? () => setMobileNavOpen(true) : toggleSidebar}
              actions={<ThemeToggle />}
            />
          )}
          {HeaderComp && (
            <header className="sticky top-14 z-10 shrink-0 border-b bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-10">
              <div className="mx-auto w-full max-w-[2000px] overflow-hidden">
                <HeaderComp />
              </div>
            </header>
          )}
          <div className="flex min-h-0 w-full min-w-0 flex-1 justify-center">
            <main className="w-full max-w-[2000px] min-w-0 flex-auto overflow-x-clip p-(--page-gutter) [--page-gutter:--spacing(6)] md:[--page-gutter:--spacing(8)] motion-safe:[&>:first-child]:animate-in motion-safe:[&>:first-child]:fade-in motion-safe:[&>:first-child]:slide-in-from-bottom-1 motion-safe:[&>:first-child]:duration-500 motion-safe:[&>:first-child]:ease-out-expo motion-safe:[&>:first-child]:fill-mode-both">
              {children}
            </main>
          </div>
        </AppInset>
      </div>
      <CommandPalette />
    </div>
  );
}

export default AuthPageLayout;
