import React from 'react';

function NonAuthPageLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-auto flex-col bg-background">
      <div className="flex min-h-0 flex-auto flex-col bg-background">
        <main className="min-h-0 flex-auto bg-background p-0 motion-safe:[&>:first-child]:animate-in motion-safe:[&>:first-child]:fade-in motion-safe:[&>:first-child]:slide-in-from-bottom-1 motion-safe:[&>:first-child]:duration-500 motion-safe:[&>:first-child]:ease-out-expo motion-safe:[&>:first-child]:fill-mode-both">
          {children}
        </main>
      </div>
    </div>
  );
}

export default NonAuthPageLayout;
