import { Badge as KitBadge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Bridged's badge: the kit Badge (identical to Qweek Site) plus the status tones the
 * dashboard uses, the way Qweek Site keeps its StatusChip outside the kit.
 * success: green with a dot · warning: amber · info: brand tint · sky: neutral info.
 */
const TONES = {
  success:
    'bg-emerald-500/10 text-success not-has-[svg]:before:size-1.5 not-has-[svg]:before:rounded-full not-has-[svg]:before:bg-current dark:bg-emerald-400/15 [a]:hover:bg-emerald-500/15',
  warning: 'bg-amber-500/12 text-warning dark:bg-amber-400/15 [a]:hover:bg-amber-500/20',
  info: 'bg-primary/10 text-primary dark:bg-primary/20 [a]:hover:bg-primary/20',
  sky: 'bg-sky-500/10 text-info dark:bg-sky-400/15 [a]:hover:bg-sky-500/15',
};

function Badge({ variant = 'default', className, ...props }) {
  const tone = TONES[variant];
  return (
    <KitBadge
      variant={tone ? 'secondary' : variant}
      data-tone={tone ? variant : undefined}
      className={cn(tone, className)}
      {...props}
    />
  );
}

// Status / preset colour names (e.g. 'green', 'error', 'processing') -> Badge variant.
const COLOR_VARIANTS = {
  success: 'success',
  green: 'success',
  lime: 'success',
  error: 'destructive',
  red: 'destructive',
  volcano: 'destructive',
  magenta: 'destructive',
  pink: 'destructive',
  warning: 'warning',
  orange: 'warning',
  gold: 'warning',
  yellow: 'warning',
  processing: 'info',
  blue: 'info',
  geekblue: 'info',
  purple: 'info',
  cyan: 'info',
  default: 'secondary',
};
function badgeVariantFromColor(color) {
  return COLOR_VARIANTS[color];
}

export { Badge, badgeVariants, badgeVariantFromColor };
