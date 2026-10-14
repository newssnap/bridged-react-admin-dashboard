import * as React from 'react';
import NumberFlow from '@number-flow/react';

/**
 * Qweek Site's AnimatedNumber: NumberFlow, so changes roll digit by digit.
 * Grouping follows the browser locale, as before.
 *
 * `countOnView`: roll up from zero the first time the number scrolls into
 * view. A number that starts below the fold snaps to 0 off-screen, then rolls
 * up once. Numbers already on screen at load just stay put.
 *
 * `countUp`: roll up from zero once, as soon as the number mounts (a headline
 * that appears when its data loads).
 *
 * NumberFlow respects prefers-reduced-motion on its own.
 */
export function AnimatedNumber({
  value,
  prefix,
  suffix,
  format,
  locales,
  countOnView = false,
  countUp = false,
  className,
}) {
  const ref = React.useRef(null);
  // "value" (show it), "armed" (parked at 0 below the fold), "counted".
  const [phase, setPhase] = React.useState(countUp ? 'armed' : 'value');

  React.useEffect(() => {
    if (!countUp) return undefined;
    // Next frame, so NumberFlow has painted 0 and animates from it.
    const frame = requestAnimationFrame(() => setPhase('counted'));
    return () => cancelAnimationFrame(frame);
  }, [countUp]);

  React.useEffect(() => {
    const element = ref.current;
    if (!countOnView || !element) return undefined;

    let seen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!seen) {
          seen = true;
          // Already visible at load: leave the real number alone.
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          setPhase('armed');
          return;
        }
        if (entry.isIntersecting) {
          setPhase('counted');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [countOnView]);

  return (
    <NumberFlow
      ref={ref}
      value={phase === 'armed' ? 0 : Number(value) || 0}
      // Snap to zero off-screen; animate every other change.
      animated={phase !== 'armed'}
      locales={locales}
      format={format}
      prefix={prefix}
      suffix={suffix}
      willChange
      className={className}
    />
  );
}

// Plain numbers only ("42", "-3.5", "80%"); anything else (times, "--", "3/5") renders as is.
const NUMERIC_TEXT = /^-?\d+(\.\d+)?%?$/;

// Show every digit the value had, as the raw value did before.
const FULL_PRECISION = { maximumFractionDigits: 20 };

/**
 * Any stat value: numbers (and plain numeric strings) roll with NumberFlow,
 * everything else (formatted times, placeholders, elements) renders unchanged.
 */
export function NumberValue({ value, format = FULL_PRECISION, ...props }) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return <AnimatedNumber value={value} format={format} {...props} />;
  }
  if (typeof value === 'string' && NUMERIC_TEXT.test(value.trim())) {
    const text = value.trim();
    const isPercent = text.endsWith('%');
    const number = text.replace('%', '');
    const decimals = number.split('.')[1]?.length ?? 0;
    return (
      <AnimatedNumber
        {...props}
        value={Number(number)}
        format={{ ...format, minimumFractionDigits: decimals }}
        suffix={isPercent ? `%${props.suffix ?? ''}` : props.suffix}
      />
    );
  }
  return value ?? null;
}
