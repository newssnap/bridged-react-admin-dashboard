import * as React from 'react';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

/**
 * Colour picker: Popover with a saturation / brightness area, hue and alpha Sliders and a
 * hex input. Works on CSS colour strings.
 *
 * - `value`: hex ('#rgb', '#rrggbb', '#rrggbbaa'), 'rgb()/rgba()', 'hsl()/hsla()' or a few
 *   colour names. Empty = no colour yet (the swatch shows a slash).
 * - `onValueChange(css, { hex, rgb })` fires while dragging and on input. `css` follows
 *   `format`:
 *   - 'hex' (default): '#rrggbb', or '#rrggbbaa' when alpha < 1 (lowercase).
 *   - 'rgb': 'rgb(r,g,b)', or 'rgba(r,g,b,a)' when alpha < 1 (no spaces).
 * - `alpha` (default true): show the alpha slider / input. With `alpha={false}` emitted
 *   colours are always opaque.
 * - `children`: a custom trigger element (rendered with `asChild`); default is a swatch.
 * - `disabled`, `className` (default trigger), `align`, `open` / `onOpenChange`.
 */

/* ------------------------------------------------------------------ */
/* Colour maths                                                        */
/* ------------------------------------------------------------------ */

const NAMED = {
  black: '000000',
  white: 'ffffff',
  red: 'ff0000',
  green: '008000',
  blue: '0000ff',
  yellow: 'ffff00',
  orange: 'ffa500',
  purple: '800080',
  gray: '808080',
  grey: '808080',
  transparent: '00000000',
};

const clamp = (n, max) => Math.min(max, Math.max(0, n));
const hex2 = n => {
  const s = Math.round(n || 0).toString(16);
  return s.length === 2 ? s : `0${s}`;
};

function splitNumbers(str) {
  const match =
    str
      .replace(/^[^(]*\((.*)/, '$1')
      .replace(/\).*/, '')
      .match(/\d*\.?\d+%?/g) || [];
  return match;
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  if (s <= 0) return [l * 255, l * 255, l * 255].map(Math.round);
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const [r, g, b] =
    hue < 60
      ? [chroma, second, 0]
      : hue < 120
        ? [second, chroma, 0]
        : hue < 180
          ? [0, chroma, second]
          : hue < 240
            ? [0, second, chroma]
            : hue < 300
              ? [second, 0, chroma]
              : [chroma, 0, second];
  const m = l - chroma / 2;
  return [r, g, b].map(c => Math.round((c + m) * 255));
}

/** Parse a CSS colour string into `{ r, g, b, a }` (0-255, alpha 0-1), or null. */
function parseColor(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim().toLowerCase();
  if (NAMED[str]) str = `#${NAMED[str]}`;
  if (/^#?[a-f\d]{3,8}$/.test(str)) {
    const s = str.replace('#', '');
    if (![3, 4, 6, 8].includes(s.length)) return null;
    const pair =
      s.length < 6 ? i => parseInt(s[i] + s[i], 16) : i => parseInt(s.substr(i * 2, 2), 16);
    return {
      r: pair(0),
      g: pair(1),
      b: pair(2),
      a: s.length === 4 || s.length === 8 ? pair(3) / 255 : 1,
    };
  }
  const parts = splitNumbers(str);
  if (parts.length < 3) return null;
  const alpha = parts[3]
    ? parts[3].includes('%')
      ? parseFloat(parts[3]) / 100
      : parseFloat(parts[3])
    : 1;
  if (str.startsWith('rgb')) {
    const [r, g, b] = parts
      .slice(0, 3)
      .map(p => (p.includes('%') ? Math.round((parseFloat(p) / 100) * 255) : parseFloat(p)));
    return { r: clamp(r, 255), g: clamp(g, 255), b: clamp(b, 255), a: clamp(alpha, 1) };
  }
  if (str.startsWith('hsl')) {
    const [r, g, b] = hslToRgb(
      parseFloat(parts[0]),
      parseFloat(parts[1]) / 100,
      parseFloat(parts[2]) / 100
    );
    return { r, g, b, a: clamp(alpha, 1) };
  }
  return null;
}

function rgbToHsv({ r, g, b, a }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    h = Math.round(
      60 *
        (r === max
          ? (g - b) / delta + (g < b ? 6 : 0)
          : g === max
            ? (b - r) / delta + 2
            : (r - g) / delta + 4)
    );
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max / 255, a };
}

function hsvToRgb({ h: hue, s, v, a }) {
  const h = ((hue % 360) + 360) % 360;
  const vv = Math.round(v * 255);
  if (s <= 0) return { r: vv, g: vv, b: vv, a };
  const hh = h / 60;
  const i = Math.floor(hh);
  const ff = hh - i;
  const p = Math.round(v * (1 - s) * 255);
  const q = Math.round(v * (1 - s * ff) * 255);
  const t = Math.round(v * (1 - s * (1 - ff)) * 255);
  const table = [
    [vv, t, p],
    [q, vv, p],
    [p, vv, t],
    [p, q, vv],
    [t, p, vv],
    [vv, p, q],
  ];
  const [r, g, b] = table[i % 6];
  return { r, g, b, a };
}

const toHexString = ({ r, g, b, a }) =>
  `#${hex2(r)}${hex2(g)}${hex2(b)}${a >= 0 && a < 1 ? hex2(a * 255) : ''}`;

const toRgbString = ({ r, g, b, a }) =>
  a !== 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

const CHECKERBOARD = {
  backgroundImage:
    'conic-gradient(rgba(0,0,0,0.06) 0 25%, transparent 0 50%, rgba(0,0,0,0.06) 0 75%, transparent 0)',
  backgroundSize: '8px 8px',
};

const SLIDER_CLASS =
  '[&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-track]]:bg-(image:--slider-track) [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:ring-2 [&_[data-slot=slider-thumb]]:ring-white';

function SaturationArea({ hsv, onChange }) {
  const ref = React.useRef(null);
  const latest = React.useRef(onChange);
  latest.current = onChange;

  const pick = event => {
    const rect = ref.current.getBoundingClientRect();
    const x = rect.width ? clamp((event.clientX - rect.left) / rect.width, 1) : 0;
    const y = rect.height ? clamp((event.clientY - rect.top) / rect.height, 1) : 0;
    latest.current({ s: x, v: 1 - y });
  };

  const onPointerDown = event => {
    if (event.button !== 0) return;
    event.preventDefault();
    const el = ref.current;
    el.setPointerCapture?.(event.pointerId);
    pick(event);
    const up = () => {
      el.removeEventListener('pointermove', pick);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', pick);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  const onKeyDown = event => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const moves = {
      ArrowLeft: { s: hsv.s - step },
      ArrowRight: { s: hsv.s + step },
      ArrowUp: { v: hsv.v + step },
      ArrowDown: { v: hsv.v - step },
    };
    if (!moves[event.key]) return;
    event.preventDefault();
    const next = { s: hsv.s, v: hsv.v, ...moves[event.key] };
    onChange({ s: clamp(next.s, 1), v: clamp(next.v, 1) });
  };

  const solid = toHexString(hsvToRgb({ ...hsv, a: 1 }));
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsv.s * 100)}
      aria-valuetext={solid}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="relative h-40 w-full cursor-crosshair touch-none overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      style={{ backgroundColor: toHexString(hsvToRgb({ h: hsv.h, s: 1, v: 1, a: 1 })) }}
    >
      <div className="absolute inset-0 bg-linear-to-r from-white to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-black to-transparent" />
      <span
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md ring-2 ring-white"
        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: solid }}
      />
    </div>
  );
}

function Swatch({ color, className }) {
  return (
    <span
      className={cn('relative overflow-hidden ring-1 ring-black/5 ring-inset', className)}
      style={CHECKERBOARD}
    >
      {color ? (
        <span className="absolute inset-0" style={{ background: toRgbString(color) }} />
      ) : (
        <span className="absolute top-1/2 left-1/2 h-0.5 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-destructive" />
      )}
    </span>
  );
}

function ColorPanel({ color, alpha, onChange }) {
  // Local HSV keeps hue / saturation while the colour is black or grey.
  const [hsv, setHsv] = React.useState(() => rgbToHsv(color ?? { r: 0, g: 0, b: 0, a: 1 }));
  const key = color ? toHexString(color) : '';
  React.useEffect(() => {
    if (!color) return;
    if (toHexString(hsvToRgb(hsv)) !== key) setHsv(rgbToHsv(color));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = patch => {
    const next = { ...hsv, ...patch };
    // A first pick on an empty colour starts opaque.
    if (!color && patch.a === undefined) next.a = 1;
    if (!alpha) next.a = 1;
    setHsv(next);
    onChange(hsvToRgb(next));
  };

  const [hexText, setHexText] = React.useState(() => (color ? toHexString(color).slice(1) : ''));
  const [alphaText, setAlphaText] = React.useState(() => String(Math.round((hsv.a ?? 1) * 100)));
  React.useEffect(() => {
    setHexText(color ? toHexString(color).slice(1, 7) : '');
    setAlphaText(String(Math.round((color?.a ?? 1) * 100)));
  }, [key, color]);

  const solid = toHexString(hsvToRgb({ ...hsv, a: 1 }));
  return (
    <div className="flex w-56 flex-col gap-3">
      <SaturationArea hsv={hsv} onChange={update} />
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col gap-3">
          <Slider
            aria-label="Hue"
            min={0}
            max={359}
            step={1}
            value={[hsv.h]}
            onValueChange={([h]) => update({ h })}
            className={SLIDER_CLASS}
            style={{
              '--slider-track':
                'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            }}
          />
          {alpha && (
            <Slider
              aria-label="Alpha"
              min={0}
              max={100}
              step={1}
              value={[Math.round((hsv.a ?? 1) * 100)]}
              onValueChange={([a]) => update({ a: a / 100 })}
              className={SLIDER_CLASS}
              style={{
                '--slider-track': `linear-gradient(to right, transparent, ${solid})`,
              }}
            />
          )}
        </div>
        <Swatch color={color} className="size-7 shrink-0 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <InputGroup className="h-8 flex-1">
          <InputGroupAddon>#</InputGroupAddon>
          <InputGroupInput
            aria-label="Hex colour"
            spellCheck={false}
            value={hexText}
            onChange={event => {
              const raw = event.target.value.replace(/[^0-9a-f]/gi, '').slice(0, alpha ? 8 : 6);
              setHexText(raw);
              const parsed = (raw.length === 6 || raw.length === 8) && parseColor(`#${raw}`);
              if (parsed) {
                const next = { ...parsed, a: alpha ? parsed.a : 1 };
                setHsv(rgbToHsv(next));
                onChange(next);
              }
            }}
            className="text-xs"
          />
        </InputGroup>
        {alpha && (
          <InputGroup className="h-8 w-20 shrink-0">
            <InputGroupInput
              aria-label="Alpha percentage"
              inputMode="numeric"
              value={alphaText}
              onChange={event => {
                const raw = event.target.value.replace(/[^\d]/g, '');
                setAlphaText(raw);
                if (raw !== '') update({ a: Math.min(100, Number(raw)) / 100 });
              }}
              onBlur={() => setAlphaText(String(Math.round((hsv.a ?? 1) * 100)))}
              className="text-xs"
            />
            <InputGroupAddon align="inline-end">%</InputGroupAddon>
          </InputGroup>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ColorPicker                                                         */
/* ------------------------------------------------------------------ */

function ColorPicker({
  value,
  onValueChange,
  format = 'hex',
  alpha = true,
  disabled = false,
  open,
  onOpenChange,
  align = 'start',
  className,
  children,
  ...props
}) {
  const color = React.useMemo(() => parseColor(value), [value]);

  const handleChange = rgb => {
    const next = alpha ? rgb : { ...rgb, a: 1 };
    const hex = toHexString(next);
    const rgbString = toRgbString(next);
    onValueChange?.(format === 'rgb' ? rgbString : hex, { hex, rgb: rgbString });
  };

  return (
    <Popover open={disabled ? false : open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild disabled={disabled}>
        {children ?? (
          <button
            type="button"
            data-slot="color-picker-trigger"
            aria-label="Pick a colour"
            disabled={disabled}
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-input/50 p-1 align-middle transition-[box-shadow,border-color,background-color] duration-150 ease-out-quad outline-none hover:bg-input/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/30',
              className
            )}
            {...props}
          >
            <Swatch color={color} className="size-full rounded-md" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-3">
        <ColorPanel color={color} alpha={alpha} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  );
}

export { ColorPicker };
