import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_HEIGHT,
  fieldName,
  metaAlias,
  metaFormat,
  resolveColor,
  toBox,
  toNumber,
  useElementWidth,
} from './_utils';
import { TooltipBox } from './TooltipBox';

/**
 * Basic funnel (G2Plot v2 `Funnel` without compareField / seriesField): each stage is a
 * trapezoid from its own size to the next stage's size (the last one is flat), sized
 * relative to the largest value. `isTransposed` lays the stages out left-to-right.
 * Supports color, funnelStyle, label (position / style / formatter), tooltip
 * (showTitle / formatter), conversionTag, legend, padding / appendPadding.
 */
export function Funnel({
  data,
  xField,
  yField,
  isTransposed,
  color,
  funnelStyle,
  label,
  tooltip,
  conversionTag,
  legend,
  meta,
  height,
  width,
  autoFit,
  padding,
  appendPadding,
  className,
  style,
}) {
  const stageField = fieldName(xField);
  const valueField = fieldName(yField);
  const [measureRef, measuredWidth] = useElementWidth();
  const [active, setActive] = React.useState(null);
  const [pointer, setPointer] = React.useState({ x: 0, y: 0 });

  const stages = React.useMemo(
    () =>
      (Array.isArray(data) ? data : [])
        .filter(datum => datum && typeof datum === 'object')
        .map((datum, index) => ({
          datum,
          name: datum[stageField],
          value: Math.max(0, toNumber(datum[valueField]) ?? 0),
          color: resolveColor(color, { name: datum[stageField], index, field: stageField, datum }),
        })),
    [data, stageField, valueField, color]
  );

  const chartHeight = toNumber(height) ?? DEFAULT_HEIGHT;
  const chartWidth = autoFit === false && toNumber(width) ? toNumber(width) : measuredWidth;
  const pad = Array.isArray(padding) || typeof padding === 'number' ? toBox(padding) : toBox(0);
  const append = toBox(appendPadding);
  const plot = {
    x: pad.left + append.left,
    y: pad.top + append.top,
    width: Math.max(0, chartWidth - pad.left - pad.right - append.left - append.right),
    height: Math.max(0, chartHeight - pad.top - pad.bottom - append.top - append.bottom),
  };

  const max = stages.reduce((m, stage) => Math.max(m, stage.value), 0) || 1;
  const count = stages.length || 1;
  // Stage axis: x when transposed, y otherwise. Size axis: the other one.
  const band = (isTransposed ? plot.width : plot.height) / count;
  const span = isTransposed ? plot.height : plot.width;
  const center = isTransposed ? plot.y + plot.height / 2 : plot.x + plot.width / 2;
  const stageStart = isTransposed ? plot.x : plot.y;

  const shapes = stages.map((stage, index) => {
    const size = (stage.value / max) * span;
    const next = index < stages.length - 1 ? (stages[index + 1].value / max) * span : size;
    const a = stageStart + index * band;
    const b = a + band;
    const points = isTransposed
      ? [
          [a, center - size / 2],
          [b, center - next / 2],
          [b, center + next / 2],
          [a, center + size / 2],
        ]
      : [
          [center - size / 2, a],
          [center + size / 2, a],
          [center + next / 2, b],
          [center - next / 2, b],
        ];
    const mid = isTransposed ? [a + band / 2, center] : [center, a + band / 2];
    return { ...stage, points, mid, boundary: b };
  });

  const fill = stage => funnelStyle?.fill ?? stage.color;
  const labelEnabled = label !== false && label !== null;
  const labelText = (stage, index) => {
    if (typeof label?.formatter === 'function')
      return label.formatter(stage.datum, undefined, index);
    return `${metaFormat(meta, stageField, stage.name)} ${metaFormat(meta, valueField, stage.value)}`;
  };

  // G2Plot shows the conversion tag unless it is turned off.
  const tagEnabled = conversionTag !== false && conversionTag !== null;
  const tagText = (current, previous) => {
    if (typeof conversionTag?.formatter === 'function') {
      return conversionTag.formatter(current.datum, previous.datum);
    }
    const rate = previous.value ? ((current.value / previous.value) * 100).toFixed(2) : '0.00';
    return `${rate}%`;
  };

  const tooltipEnabled = tooltip !== false && tooltip !== null;
  const activeStage = active !== null ? shapes[active] : null;
  const tooltipItem = stage => {
    let name = stage.name;
    let value = metaFormat(meta, valueField, stage.value);
    if (typeof tooltip?.formatter === 'function') {
      const result = tooltip.formatter(stage.datum) || {};
      if (result.name !== undefined) name = result.name;
      if (result.value !== undefined) value = result.value;
    } else if (name === undefined) {
      name = metaAlias(meta, valueField);
    }
    return { name, value, color: fill(stage) };
  };

  const handlePointer = (event, index) => {
    const rect = measureRef.current?.getBoundingClientRect();
    if (rect) setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (index !== active) setActive(index);
  };

  return (
    <div className={className} style={style}>
      <div
        ref={measureRef}
        className="relative font-sans text-xs"
        style={{
          height: chartHeight,
          width: autoFit === false && toNumber(width) ? chartWidth : '100%',
        }}
        onMouseLeave={() => setActive(null)}
      >
        {chartWidth > 0 && (
          <svg
            width={chartWidth}
            height={chartHeight}
            className="block animate-in overflow-visible duration-300 ease-out-quad fade-in-0"
            role="img"
          >
            {shapes.map((stage, index) => (
              <polygon
                key={index}
                points={stage.points.map(p => p.join(',')).join(' ')}
                fill={fill(stage)}
                stroke={funnelStyle?.stroke ?? 'var(--background)'}
                strokeWidth={funnelStyle?.lineWidth ?? 1}
                strokeLinejoin="round"
                onMouseMove={event => handlePointer(event, index)}
                onMouseEnter={event => handlePointer(event, index)}
              />
            ))}
            {labelEnabled &&
              shapes.map((stage, index) => {
                const text = labelText(stage, index);
                if (text === null || text === undefined || text === '') return null;
                return (
                  <text
                    key={`label-${index}`}
                    x={stage.mid[0]}
                    y={stage.mid[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    pointerEvents="none"
                    fontSize={label?.style?.fontSize ?? 12}
                    fontWeight={label?.style?.fontWeight ?? 500}
                    fill={label?.style?.fill ?? 'var(--primary-foreground)'}
                  >
                    {String(text)}
                  </text>
                );
              })}
            {tagEnabled &&
              shapes.slice(1).map((stage, i) => {
                const previous = shapes[i];
                const text = tagText(stage, previous);
                const at = previous.boundary;
                return (
                  <text
                    key={`tag-${i}`}
                    x={isTransposed ? at : plot.x + plot.width}
                    y={isTransposed ? plot.y + plot.height : at}
                    textAnchor={isTransposed ? 'middle' : 'end'}
                    dominantBaseline={isTransposed ? 'auto' : 'central'}
                    pointerEvents="none"
                    fontSize={11}
                    className="fill-muted-foreground"
                  >
                    {String(text)}
                  </text>
                );
              })}
          </svg>
        )}
        {tooltipEnabled && (
          <TooltipBox
            visible={!!activeStage}
            x={pointer.x}
            y={pointer.y}
            containerWidth={chartWidth}
            title={
              activeStage && tooltip?.showTitle !== false
                ? metaFormat(meta, stageField, activeStage.name)
                : null
            }
            items={activeStage ? [tooltipItem(activeStage)] : []}
          />
        )}
      </div>
      {legend !== false && legend !== null && stages.length > 0 && (
        <div className={cn('flex flex-wrap items-center justify-center gap-4 pt-3 text-xs')}>
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: fill(stage) }}
              />
              <span className="text-muted-foreground">{String(stage.name)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
