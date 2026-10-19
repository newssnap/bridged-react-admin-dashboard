import * as React from 'react';
import * as Recharts from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  chartAnimation,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import {
  DEFAULT_HEIGHT,
  fieldName,
  formatTooltipItems,
  metaAlias,
  metaFormat,
  resolveColor,
  toBox,
  toNumber,
} from './_utils';

/**
 * Line / Area / Column / Bar with the G2Plot v2 config API the app uses
 * (@ant-design/charts 1.4 and @ant-design/plots 1.2), rendered with recharts in the
 * shadcn chart style: muted axes without axis lines, faint horizontal grid only,
 * ChartTooltip / ChartTooltipContent, series colours from the brand ramp unless the
 * config sets `color`.
 */

const LINE_HEIGHT = 14;

/** G2 data is long-format (one row per x per series); recharts wants one row per x. */
function pivot(data, catField, valueField, seriesField) {
  const rows = [];
  const rowByCat = new Map();
  const series = [];
  const seriesIndex = new Map();
  (Array.isArray(data) ? data : []).forEach(datum => {
    if (!datum || typeof datum !== 'object') return;
    const cat = datum[catField];
    const name = seriesField ? datum[seriesField] : valueField;
    if (!seriesIndex.has(name)) {
      seriesIndex.set(name, series.length);
      series.push({ name, key: `s${series.length}`, datum });
    }
    const key = series[seriesIndex.get(name)].key;
    let row = rowByCat.get(cat);
    if (!row) {
      row = { __x: cat, __d: {} };
      rowByCat.set(cat, row);
      rows.push(row);
    }
    row[key] = toNumber(datum[valueField]);
    row.__d[key] = datum;
  });
  return { rows, series };
}

/** G2 axis label text: meta formatter first, then `axis.label.formatter(text, item, index)`. */
function makeTickText(axis, meta, field) {
  return (value, index) => {
    const metaText = metaFormat(meta, field, value);
    const text = metaText === null || metaText === undefined ? '' : String(metaText);
    const formatter = axis?.label?.formatter;
    if (typeof formatter === 'function') {
      const result = formatter(text, { value, name: text }, index);
      return result === null || result === undefined ? '' : String(result);
    }
    return text;
  };
}

const defaultValueText = value =>
  typeof value === 'number' ? value.toLocaleString() : String(value ?? '');

/**
 * Category tick: supports '\n' line breaks from a label formatter. When G2's autoHide /
 * autoEllipsis would apply (the default), long labels are ellipsised (full text on hover).
 */
function CategoryTick({ x, y, payload, index, getText, ellipsis, vertical }) {
  const text = getText(payload?.value, index);
  const lines = String(text).split('\n');
  const shown =
    ellipsis && lines.length === 1 && lines[0].length > 18 ? [`${lines[0].slice(0, 16)}…`] : lines;
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{lines.join(' ')}</title>
      <text
        textAnchor={vertical ? 'end' : 'middle'}
        className="fill-muted-foreground"
        fontSize={12}
        dy={vertical ? -((shown.length - 1) * LINE_HEIGHT) / 2 + 4 : 0}
      >
        {shown.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? (vertical ? 0 : 12) : LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function legendLayout(position = 'top-left') {
  const [side, align] = String(position).split('-');
  if (side === 'left' || side === 'right') {
    return {
      layout: 'vertical',
      verticalAlign: align === 'top' ? 'top' : align === 'bottom' ? 'bottom' : 'middle',
      align: side,
      className: 'flex-col items-start gap-2 px-3',
    };
  }
  return {
    layout: 'horizontal',
    verticalAlign: side === 'bottom' ? 'bottom' : 'top',
    align: align === 'left' ? 'left' : align === 'right' ? 'right' : 'center',
    className: align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : undefined,
  };
}

/** G2 annotations of type 'line' ('min' / 'max' / 'median' / value positions) and 'text'. */
function renderAnnotations(annotations, { horizontal }) {
  if (!Array.isArray(annotations)) return null;
  const isEdge = v => v === 'min' || v === 'max' || v === 'start' || v === 'end';
  return annotations.map((annotation, index) => {
    if (!annotation) return null;
    const style = annotation.style || {};
    const stroke = style.stroke || 'var(--muted-foreground)';
    const strokeDasharray = Array.isArray(style.lineDash) ? style.lineDash.join(' ') : undefined;
    const strokeWidth = style.lineWidth ?? 1;
    const text = annotation.text?.content;
    if (
      annotation.type === 'line' &&
      Array.isArray(annotation.start) &&
      Array.isArray(annotation.end)
    ) {
      const [sx, sy] = annotation.start;
      const [ex, ey] = annotation.end;
      const common = {
        stroke,
        strokeDasharray,
        strokeWidth,
        ifOverflow: 'extendDomain',
        label: text
          ? { value: text, position: 'insideTopRight', fontSize: 11, fill: stroke }
          : undefined,
      };
      // [x, y] positions: x is the category axis, y the value axis (transposed for Bar).
      if (!isEdge(sy) && sy === ey && isEdge(sx) && isEdge(ex)) {
        const value = toNumber(sy);
        if (value === null) return null;
        return horizontal ? (
          <Recharts.ReferenceLine key={`annotation-${index}`} {...common} x={value} />
        ) : (
          <Recharts.ReferenceLine key={`annotation-${index}`} {...common} y={value} />
        );
      }
      if (!isEdge(sx) && sx === ex) {
        return horizontal ? (
          <Recharts.ReferenceLine key={`annotation-${index}`} {...common} y={sx} />
        ) : (
          <Recharts.ReferenceLine key={`annotation-${index}`} {...common} x={sx} />
        );
      }
      return null;
    }
    if (annotation.type === 'text' && Array.isArray(annotation.position)) {
      const [px, py] = annotation.position;
      const value = toNumber(py);
      if (value === null || isEdge(px)) return null;
      const content =
        typeof annotation.content === 'function' ? annotation.content() : annotation.content;
      return (
        <Recharts.ReferenceDot
          key={`annotation-${index}`}
          x={horizontal ? value : px}
          y={horizontal ? px : value}
          r={0}
          ifOverflow="extendDomain"
          label={{
            value: content,
            position: 'top',
            fontSize: style.fontSize ?? 11,
            fill: style.fill || 'var(--muted-foreground)',
          }}
        />
      );
    }
    return null;
  });
}

export function CartesianChart({
  kind,
  data,
  xField,
  yField,
  seriesField,
  colorField,
  isGroup,
  isStack,
  smooth,
  point,
  color,
  height,
  width,
  autoFit,
  padding,
  appendPadding,
  xAxis,
  yAxis,
  meta,
  tooltip,
  legend,
  label,
  columnWidthRatio,
  barWidthRatio,
  columnStyle,
  barStyle,
  lineStyle,
  areaStyle,
  annotations,
  className,
  style,
}) {
  const horizontal = kind === 'bar';
  // G2Plot Bar swaps the roles: xField holds the value, yField the category.
  const catField = fieldName(horizontal ? yField : xField);
  const valueField = fieldName(horizontal ? xField : yField);
  const catAxis = horizontal ? yAxis : xAxis;
  const valueAxis = horizontal ? xAxis : yAxis;

  // A series field equal to the category field only colours the bars (no dodge).
  const series_ = seriesField && seriesField !== catField ? seriesField : undefined;
  const colorByCategory =
    (kind === 'column' || kind === 'bar') &&
    !series_ &&
    ((colorField && colorField === catField) || (seriesField && seriesField === catField));

  const uid = React.useId().replace(/:/g, '');
  const { rows, series } = React.useMemo(
    () => pivot(data, catField, valueField, series_),
    [data, catField, valueField, series_]
  );

  // Area configs may carry their fill in `style.fill` (G2 v5 style); use it as the colour.
  const configColor = color ?? (kind === 'area' ? style?.fill : undefined);
  const seriesColors = series.map((s, index) =>
    resolveColor(configColor, { name: s.name, index, field: series_, datum: s.datum })
  );
  const categoryColors = colorByCategory
    ? rows.map((row, index) =>
        resolveColor(configColor, {
          name: row.__x,
          index,
          field: colorField || seriesField,
          datum: row.__d[series[0]?.key],
        })
      )
    : null;

  const chartConfig = React.useMemo(() => {
    const config = {};
    series.forEach((s, index) => {
      config[s.key] = {
        label: series_ ? String(s.name) : String(metaAlias(meta, valueField)),
        color: seriesColors[index],
      };
    });
    return config;
    // seriesColors is derived from the same inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, series_, meta, valueField, seriesColors.join('|')]);

  const chartHeight = toNumber(height) ?? DEFAULT_HEIGHT;
  const containerWidth = autoFit === false && toNumber(width) ? toNumber(width) : '100%';
  const pad = Array.isArray(padding) || typeof padding === 'number' ? toBox(padding) : null;
  const append = toBox(appendPadding);
  // Axes size themselves in recharts, so only the outer edges of a G2 padding apply.
  const margin = {
    top: (pad ? pad.top : 12) + append.top,
    right: (pad ? pad.right : 16) + append.right,
    bottom: append.bottom,
    left: append.left,
  };

  // ----- axes -----
  const catText = makeTickText(catAxis, meta, catField);
  const valueText = valueAxis?.label?.formatter
    ? makeTickText(valueAxis, meta, valueField)
    : value => {
        const formatted = metaFormat(meta, valueField, value);
        return formatted === value ? defaultValueText(value) : String(formatted);
      };
  const catLabelOpts = catAxis?.label || {};
  const showAllCats = catLabelOpts.autoHide === false;
  const catTickCount = toNumber(catAxis?.tickCount);
  const catInterval = catTickCount
    ? Math.max(0, Math.ceil(rows.length / catTickCount) - 1)
    : showAllCats
      ? 0
      : 'preserveStartEnd';
  const maxLines = rows.reduce(
    (max, row, index) => Math.max(max, catText(row.__x, index).split('\n').length),
    1
  );
  const catTick = props => (
    <CategoryTick
      {...props}
      getText={catText}
      ellipsis={catLabelOpts.autoEllipsis !== false && !showAllCats}
      vertical={horizontal}
    />
  );
  const catHidden = catAxis === false || catAxis === null;
  const valueHidden = valueAxis === false || valueAxis === null;
  const axisTitle = axis =>
    axis?.title?.text
      ? { value: axis.title.text, fontSize: 12, className: 'fill-muted-foreground' }
      : undefined;

  const categoryAxisProps = {
    dataKey: '__x',
    type: 'category',
    hide: catHidden,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    interval: catInterval,
    minTickGap: 8,
    tick: catTick,
    label: axisTitle(catAxis),
  };
  const valueAxisProps = {
    type: 'number',
    hide: valueHidden,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tickCount: toNumber(valueAxis?.tickCount) ?? 5,
    tickFormatter: (value, index) => valueText(value, index),
    allowDecimals: true,
    label: axisTitle(valueAxis),
  };
  const showGrid = valueAxis?.grid !== null && valueAxis?.grid !== false && !valueHidden;

  // ----- tooltip -----
  const tooltipEnabled = tooltip !== false && tooltip !== null;
  const tooltipContent = contentProps => {
    const items = formatTooltipItems(contentProps.payload, {
      tooltip,
      meta,
      valueField,
      getDatum: item => item?.payload?.__d?.[item.dataKey],
    });
    const first = contentProps.payload?.[0]?.payload;
    const title = first ? metaFormat(meta, catField, first.__x) : contentProps.label;
    const rowIndex = first ? rows.indexOf(first) : -1;
    return (
      <ChartTooltipContent
        {...contentProps}
        payload={items}
        color={categoryColors && rowIndex >= 0 ? categoryColors[rowIndex] : undefined}
        hideLabel={tooltip?.showTitle === false}
        labelFormatter={() => (title === null || title === undefined ? '' : String(title))}
      />
    );
  };

  // ----- legend -----
  const showLegend = legend !== false && legend !== null && !!series_ && series.length > 0;
  const legendOpts = legendLayout(legend?.position);

  // ----- series -----
  const ChartRoot =
    kind === 'line' ? Recharts.LineChart : kind === 'area' ? Recharts.AreaChart : Recharts.BarChart;
  const curve = smooth ? 'monotone' : 'linear';
  const pointStyle = point ? point.style || {} : null;
  const shapeStyle = (kind === 'column' ? columnStyle : barStyle) || {};
  const defaultRadius = horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0];
  const radius =
    shapeStyle.radius !== undefined
      ? Array.isArray(shapeStyle.radius)
        ? horizontal
          ? // G2's radius runs from the bar's base corner; map it onto the right end.
            [
              shapeStyle.radius[3] ?? 0,
              shapeStyle.radius[0] ?? 0,
              shapeStyle.radius[1] ?? 0,
              shapeStyle.radius[2] ?? 0,
            ]
          : shapeStyle.radius
        : shapeStyle.radius
      : defaultRadius;
  const widthRatio = toNumber(kind === 'column' ? columnWidthRatio : barWidthRatio);
  const barCategoryGap = widthRatio ? `${Math.round((1 - widthRatio) * 100)}%` : '25%';
  const stackId = isStack && !isGroup ? 'stack' : undefined;

  const renderLabels = s => {
    if (!label) return null;
    return (
      <Recharts.LabelList
        dataKey={s.key}
        content={props => {
          const { x, y, width: w = 0, height: h = 0, index, value } = props;
          if (value === null || value === undefined) return null;
          const datum = rows[index]?.__d?.[s.key];
          const text =
            typeof label.formatter === 'function'
              ? label.formatter(datum, undefined, index)
              : metaFormat(meta, valueField, value);
          const isMiddle = label.position === 'middle';
          const cx = horizontal ? (isMiddle ? x + w / 2 : x + w + 6) : x + w / 2;
          const cy = horizontal ? y + h / 2 : isMiddle ? y + h / 2 : y - 6;
          return (
            <text
              x={cx}
              y={cy}
              textAnchor={horizontal && !isMiddle ? 'start' : 'middle'}
              dominantBaseline={isMiddle || horizontal ? 'central' : 'auto'}
              fontSize={label.style?.fontSize ?? 11}
              fontWeight={label.style?.fontWeight}
              fill={label.style?.fill}
              className={label.style?.fill ? undefined : 'fill-muted-foreground'}
            >
              {text === null || text === undefined ? '' : String(text)}
            </text>
          );
        }}
      />
    );
  };

  const seriesElements = series.map((s, index) => {
    const seriesColor = seriesColors[index];
    const name = chartConfig[s.key]?.label;
    const animation = { ...chartAnimation, animationBegin: index * 80 };
    if (kind === 'line') {
      return (
        <Recharts.Line
          key={s.key}
          dataKey={s.key}
          name={name}
          type={curve}
          stroke={seriesColor}
          strokeWidth={lineStyle?.lineWidth ?? 2}
          strokeDasharray={
            Array.isArray(lineStyle?.lineDash) ? lineStyle.lineDash.join(' ') : undefined
          }
          connectNulls
          dot={
            pointStyle
              ? {
                  r: point.size ?? 3,
                  fill: pointStyle.fill ?? seriesColor,
                  stroke: pointStyle.stroke ?? seriesColor,
                  strokeWidth: pointStyle.lineWidth ?? 1,
                }
              : false
          }
          activeDot={{ r: 4, fill: seriesColor, stroke: 'var(--background)', strokeWidth: 2 }}
          {...animation}
        >
          {renderLabels(s)}
        </Recharts.Line>
      );
    }
    if (kind === 'area') {
      const gradientId = `${uid}-fill-${s.key}`;
      return (
        <Recharts.Area
          key={s.key}
          dataKey={s.key}
          name={name}
          type={curve}
          stroke={seriesColor}
          strokeWidth={lineStyle?.lineWidth ?? 2}
          fill={areaStyle?.fill ?? `url(#${gradientId})`}
          fillOpacity={areaStyle?.fillOpacity ?? 1}
          stackId={stackId}
          connectNulls
          dot={
            pointStyle
              ? {
                  r: point.size ?? 3,
                  fill: pointStyle.fill ?? seriesColor,
                  stroke: pointStyle.stroke ?? seriesColor,
                }
              : false
          }
          activeDot={{ r: 4, fill: seriesColor, stroke: 'var(--background)', strokeWidth: 2 }}
          {...animation}
        >
          {renderLabels(s)}
        </Recharts.Area>
      );
    }
    return (
      <Recharts.Bar
        key={s.key}
        dataKey={s.key}
        name={name}
        fill={seriesColor}
        radius={radius}
        stackId={stackId}
        maxBarSize={64}
        style={shapeStyle.cursor ? { cursor: shapeStyle.cursor } : undefined}
        {...animation}
      >
        {categoryColors &&
          rows.map((row, rowIndex) => (
            <Recharts.Cell key={`cell-${rowIndex}`} fill={categoryColors[rowIndex]} />
          ))}
        {renderLabels(s)}
      </Recharts.Bar>
    );
  });

  const gradients =
    kind === 'area' ? (
      <defs>
        {series.map((s, index) => (
          <linearGradient key={s.key} id={`${uid}-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={seriesColors[index]} stopOpacity={0.35} />
            <stop offset="95%" stopColor={seriesColors[index]} stopOpacity={0.02} />
          </linearGradient>
        ))}
      </defs>
    ) : null;

  const catAxisHeight = horizontal ? undefined : maxLines * LINE_HEIGHT + 16;

  return (
    <div
      className={className}
      style={style && kind === 'area' ? { ...style, fill: undefined } : style}
    >
      <ChartContainer
        config={chartConfig}
        className="aspect-auto font-sans"
        style={{ height: chartHeight, width: containerWidth }}
      >
        <ChartRoot
          accessibilityLayer
          data={rows}
          margin={margin}
          layout={horizontal ? 'vertical' : 'horizontal'}
          barCategoryGap={kind === 'column' || kind === 'bar' ? barCategoryGap : undefined}
          barGap={4}
        >
          {gradients}
          {showGrid && <Recharts.CartesianGrid vertical={horizontal} horizontal={!horizontal} />}
          {horizontal ? (
            <>
              <Recharts.XAxis {...valueAxisProps} />
              <Recharts.YAxis {...categoryAxisProps} width="auto" />
            </>
          ) : (
            <>
              <Recharts.XAxis {...categoryAxisProps} height={catAxisHeight} />
              <Recharts.YAxis {...valueAxisProps} width="auto" />
            </>
          )}
          {tooltipEnabled && (
            <ChartTooltip
              isAnimationActive={false}
              cursor={
                kind === 'column' || kind === 'bar'
                  ? { fill: 'var(--muted)' }
                  : { stroke: 'var(--border)', strokeWidth: 1 }
              }
              content={tooltipContent}
              wrapperStyle={{ zIndex: 10, outline: 'none' }}
            />
          )}
          {showLegend && (
            <ChartLegend
              layout={legendOpts.layout}
              verticalAlign={legendOpts.verticalAlign}
              align={legendOpts.align}
              content={
                <ChartLegendContent
                  verticalAlign={legendOpts.verticalAlign}
                  className={cn(legendOpts.className)}
                />
              }
            />
          )}
          {renderAnnotations(annotations, { horizontal })}
          {seriesElements}
        </ChartRoot>
      </ChartContainer>
    </div>
  );
}
