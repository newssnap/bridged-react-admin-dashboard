import {
  Card as KitCard,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter as KitCardFooter,
  CardHeader as KitCardHeader,
  CardTitle as KitCardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Bridged's page surfaces: the kit Card (identical to Qweek Site) drawn flat, the way
 * Qweek Site's dashboard draws its panels (rounded-lg like tables and inputs, hairline ring, no shadow).
 * Same parts and props as the kit Card.
 */
function Card({ className, ...props }) {
  return (
    <KitCard
      className={cn(
        'rounded-lg shadow-none ring-foreground/10 [--card-spacing:--spacing(5)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <KitCardHeader className={cn('gap-1 rounded-t-lg', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <KitCardTitle className={cn('font-semibold', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <KitCardFooter className={cn('rounded-b-lg', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
