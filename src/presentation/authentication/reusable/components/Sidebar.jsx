import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Building03Icon,
  CreditCardIcon,
  DashboardSquare02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

const entrance = (delay = 'delay-300') =>
  `animate-in fade-in-0 slide-in-from-bottom-6 duration-700 ease-out-expo fill-mode-both ${delay} motion-reduce:slide-in-from-bottom-0`;

const AREAS = [
  { icon: DashboardSquare02Icon, label: 'Accounts', hint: 'Users, agents and playbooks' },
  { icon: UserGroupIcon, label: 'Teams', hint: 'Members, owners and access' },
  { icon: Building03Icon, label: 'Companies', hint: 'Organisations and their users' },
  { icon: CreditCardIcon, label: 'Billing and credits', hint: 'Team credits and custom work' },
];

/**
 * The brand panel beside the login form: logo, headline and what the admin dashboard
 * covers. Decorative, so aria-hidden.
 */
function Sidebar({ Sidebarcontent }) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative flex h-full min-h-56 flex-col justify-between gap-8 overflow-hidden bg-primary text-primary-foreground lg:rounded-xl',
        "after:pointer-events-none after:absolute after:-top-[40%] after:-right-[10%] after:aspect-[3/4] after:w-72 after:rounded-t-full after:border-[40px] after:border-b-0 after:border-primary-foreground/8 after:content-[''] sm:after:w-96"
      )}
    >
      <div className="relative z-10 px-6 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <img src="/company/logo_White.png" alt="" className="w-[110px] lg:w-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-10 px-6 pb-12 sm:px-8 lg:px-12 lg:pb-12">
        <p className="max-w-lg text-[30px] leading-[1.05] font-bold tracking-[-0.04em] text-balance lg:text-4xl xl:text-[44px]">
          {Sidebarcontent}
        </p>

        <ul className={cn('hidden max-w-md grid-cols-2 gap-3 lg:grid', entrance())}>
          {AREAS.map(area => (
            <li
              key={area.label}
              className="flex flex-col gap-3 rounded-lg bg-primary-foreground/[0.08] p-4 ring-1 ring-primary-foreground/10"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-primary-foreground/10">
                <HugeiconsIcon icon={area.icon} strokeWidth={1.75} className="size-[18px]" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{area.label}</span>
                <span className="text-xs text-primary-foreground/70">{area.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
