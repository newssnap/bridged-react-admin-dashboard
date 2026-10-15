import * as React from 'react';
import * as Recharts from 'recharts';
import { ChartContainer, ChartTooltipContent, chartAnimation } from '@/components/ui/chart';
import {
  DEFAULT_HEIGHT,
  fieldName,
  formatTooltipItems,
  resolveColor,
  toBox,
  toNumber,
  uniqueInOrder,
} from './_utils';

/**
 * Pie / donut with the G2Plot v2 config the app uses: angleField, colorField, radius,
 * innerRadius, meta formatter, legend, tooltip, statistic (centre text of a donut).
 */
export function Pie({
  data,
  angleField,
  colorField,
  color,
  radius = 1,
  innerRadius = 0,
  meta,
  tooltip,
  legend,
  statistic,
  height,
  width,
  autoFit,
  appendPadding,
  className,
  style,
}) {
  const valueField = fieldName(angleField);
  const nameField = fieldName(colorField);
  const categories = React.useMemo(() => uniqueInOrder(data, nameField), [data, nameField]);

  const rows = React.useMemo(
    () =>
      (Array.isArray(data) ? data : [])
        .filter(datum => datum && typeof datum === 'object')
        .map(datum => {
          const index = categories.indexOf(datum[nameField]);
          return {
            __n: datum[nameField] === undefined ? '' : String(datum[nameField]),
            __v: toNumber(datum[valueField]) ?? 0,
            __datum: datum,
            fill: resolveColor(color, { name: datum[nameField], index, field: nameField, datum }),
          };
        }),
    [data, categories, nameField, valueField, color]
  );

  const chartHeight = toNumber(height) ?? DEFAULT_HEIGHT;
  const containerWidth = autoFit === false && toNumber(width) ? toNumber(width) : '100%';
  const append = toBox(appendPadding);
  const outer = `${Math.round((toNumber(radius) ?? 1) * 100)}%`;
  const inner = innerRadius ? `${Math.round(toNumber(innerRadius) * 100)}%` : 0;

  const tooltipEnabled = tooltip !== false && tooltip !== null;
  const tooltipContent = contentProps => (
    <ChartTooltipContent
      {...contentProps}
      hideLabel
      payload={formatTooltipItems(contentProps.payload, {
        tooltip,
        meta,
        valueField,
        getDatum: item => item?.payload?.__datum ?? item?.payload?.payload?.__datum,
      })}
    />
  );

  // A donut shows its statistic only when the config gives it some text.
  const statisticTitle =
    statistic && statistic.title !== false && statistic.title?.content
      ? statistic.title.content
      : '';
  const statisticContent =
    statistic && statistic.content !== false
      ? typeof statistic.content === 'string'
        ? statistic.content
        : statistic.content?.content || ''
      : '';

  return (
    <div className={className} style={style}>
      <ChartContainer
        config={{}}
        className="aspect-auto font-sans"
        style={{ height: chartHeight, width: containerWidth }}
      >
        <Recharts.PieChart
          margin={{
            top: 8 + append.top,
            right: 8 + append.right,
            bottom: 8 + append.bottom,
            left: 8 + append.left,
          }}
        >
          {tooltipEnabled && (
            <Recharts.Tooltip
              isAnimationActive={false}
              content={tooltipContent}
              wrapperStyle={{ zIndex: 10, outline: 'none' }}
            />
          )}
          <Recharts.Pie
            data={rows}
            dataKey="__v"
            nameKey="__n"
            outerRadius={outer}
            innerRadius={inner}
            paddingAngle={inner ? 2 : 0}
            cornerRadius={inner ? 4 : 0}
            stroke="var(--background)"
            strokeWidth={inner ? 0 : 2}
            {...chartAnimation}
          >
            {rows.map((row, index) => (
              <Recharts.Cell key={`cell-${index}`} fill={row.fill} />
            ))}
          </Recharts.Pie>
          {inner && (statisticTitle || statisticContent) ? (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
            >
              {statisticTitle && (
                <tspan x="50%" dy={statisticContent ? '-0.6em' : 0} fontSize={12}>
                  {statisticTitle}
                </tspan>
              )}
              {statisticContent && (
                <tspan x="50%" dy={statisticTitle ? '1.4em' : 0} fontSize={20} fontWeight={600}>
                  {statisticContent}
                </tspan>
              )}
            </text>
          ) : null}
        </Recharts.PieChart>
      </ChartContainer>
      {legend !== false && legend !== null && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs">
          {categories.map((name, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: resolveColor(color, { name, index, field: nameField }),
                }}
              />
              <span className="text-muted-foreground">{String(name)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
