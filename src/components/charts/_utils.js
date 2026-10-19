import * as React from 'react';

/**
 * Shared helpers for the @ant-design/charts (G2Plot v2) compatible chart components.
 * The app passes G2Plot configs; these helpers translate the parts of that config the
 * app uses into recharts / SVG terms.
 */

/** G2Plot sizes the canvas to `height` (400 by default) and the container's width. */
export const DEFAULT_HEIGHT = 400;

/**
 * Series colours when a config sets none: the brand ramp (`--chart-1..5` all derive
 * from the dynamic `--primary`). The primary itself comes first, then alternating
 * light / dark steps so neighbouring series stay distinguishable.
 */
export const RAMP = [
  'var(--chart-4)',
  'var(--chart-2)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-3)',
];

/** G2Plot accepts `yField: ['a']` and reads the first entry. */
export const fieldName = field => (Array.isArray(field) ? field[0] : field);

export const toNumber = value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

/** Distinct values of `field`, in order of first appearance (G2's category scale order). */
export function uniqueInOrder(data, field) {
  const seen = new Set();
  const out = [];
  (Array.isArray(data) ? data : []).forEach(datum => {
    if (!datum) return;
    const value = datum[field];
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  });
  return out;
}

/**
 * G2Plot `color`: a string (every series), an array (by series / category order) or a
 * function receiving the datum's colour-field value. Falls back to the brand ramp.
 */
export function resolveColor(color, { name, index, field, datum }) {
  if (typeof color === 'string' && color) return color;
  if (Array.isArray(color) && color.length) return color[index % color.length];
  if (typeof color === 'function') {
    const result = color(field ? { ...(datum || {}), [field]: name } : datum || {});
    if (result) return result;
  }
  return RAMP[index % RAMP.length];
}

/** G2 padding / appendPadding: number | [top, right, bottom, left] | [v, h] | 'auto'. */
export function toBox(padding) {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }
  if (Array.isArray(padding)) {
    const [top = 0, right = top, bottom = top, left = right] = padding.map(v => Number(v) || 0);
    return { top, right, bottom, left };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

export const metaAlias = (meta, field) => meta?.[field]?.alias ?? field;

export const metaFormat = (meta, field, value) => {
  const formatter = meta?.[field]?.formatter;
  return typeof formatter === 'function' ? formatter(value) : value;
};

/** Width of an element's content box, kept in sync with ResizeObserver. */
export function useElementWidth() {
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => setWidth(element.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/**
 * Applies the G2Plot tooltip config (`formatter(datum) => { name, value }`, meta
 * formatter) to recharts tooltip payload items.
 */
export function formatTooltipItems(payload, { tooltip, meta, valueField, getDatum }) {
  return (payload || []).map(item => {
    const datum = getDatum(item);
    let { name, value } = item;
    if (tooltip && typeof tooltip.formatter === 'function' && datum) {
      const result = tooltip.formatter(datum) || {};
      if (result.name !== undefined) name = result.name;
      if (result.value !== undefined) value = result.value;
    } else if (valueField) {
      value = metaFormat(meta, valueField, value);
    }
    return { ...item, name, value };
  });
}
