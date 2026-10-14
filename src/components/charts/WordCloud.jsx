import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_HEIGHT,
  fieldName,
  resolveColor,
  toBox,
  toNumber,
  uniqueInOrder,
  useElementWidth,
} from './_utils';
import { TooltipBox } from './TooltipBox';

/**
 * Word cloud with the G2Plot v2 config the app uses (wordField, weightField, colorField,
 * color, wordStyle { fontSize, rotation, rotationSteps, padding, fontWeight, fontFamily },
 * tooltip, interactions, height / autoFit, padding).
 *
 * Layout: a deterministic Archimedean spiral (the d3-cloud spiral G2 uses, without the
 * random start). Words go in by weight, largest first, from the centre outwards; each
 * one takes the first spiral position where its padded box is free on an occupancy grid.
 * Words that cannot fit are left out, as in G2. Same data and size → same layout.
 */

const GRID = 2; // occupancy grid cell, px
const DEFAULT_FONT_SIZE = [20, 60]; // G2Plot WordCloud defaults
const DEFAULT_PADDING = 1;

let measureContext = null;
function measureText(text, fontSize, fontWeight, fontFamily) {
  if (measureContext === null && typeof document !== 'undefined') {
    try {
      measureContext = document.createElement('canvas').getContext('2d') || false;
    } catch (error) {
      measureContext = false;
    }
  }
  if (measureContext) {
    measureContext.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const width = measureContext.measureText(text).width;
    if (width > 0) return width;
  }
  return text.length * fontSize * 0.56;
}

function rotationFor(wordStyle, index) {
  const rotation = wordStyle.rotation ?? [0, 90];
  if (typeof rotation === 'number') return rotation;
  if (Array.isArray(rotation) && rotation.length) {
    const [from, to = from] = rotation;
    const steps = Math.max(1, toNumber(wordStyle.rotationSteps) ?? 2);
    if (steps === 1 || from === to) return from;
    return from + ((index % steps) * (to - from)) / (steps - 1);
  }
  return 0;
}

function layoutWords(words, width, height, fontFamily) {
  if (!width || !height || !words.length) return [];
  const cols = Math.ceil(width / GRID);
  const rows = Math.ceil(height / GRID);
  const grid = new Uint8Array(cols * rows);

  const isFree = (x0, y0, x1, y1) => {
    const c0 = Math.floor(x0 / GRID);
    const c1 = Math.min(cols - 1, Math.ceil(x1 / GRID) - 1);
    const r0 = Math.floor(y0 / GRID);
    const r1 = Math.min(rows - 1, Math.ceil(y1 / GRID) - 1);
    for (let r = r0; r <= r1; r += 1) {
      const offset = r * cols;
      for (let c = c0; c <= c1; c += 1) {
        if (grid[offset + c]) return false;
      }
    }
    return true;
  };
  const occupy = (x0, y0, x1, y1) => {
    const c0 = Math.floor(x0 / GRID);
    const c1 = Math.min(cols - 1, Math.ceil(x1 / GRID) - 1);
    const r0 = Math.floor(y0 / GRID);
    const r1 = Math.min(rows - 1, Math.ceil(y1 / GRID) - 1);
    for (let r = r0; r <= r1; r += 1) {
      grid.fill(1, r * cols + c0, r * cols + c1 + 1);
    }
  };

  const aspect = width / height;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.max(width / aspect, height) / 2 + 40;
  const placed = [];

  words.forEach(word => {
    const textWidth = measureText(word.text, word.fontSize, word.fontWeight, fontFamily);
    const textHeight = word.fontSize * 0.9;
    const angle = (word.rotate * Math.PI) / 180;
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    const boxW = textWidth * cos + textHeight * sin + word.padding * 2;
    const boxH = textWidth * sin + textHeight * cos + word.padding * 2;
    if (boxW > width || boxH > height) return;

    // d3-cloud's archimedean spiral: radius == angle (px / rad), x stretched by the aspect.
    for (let t = 0; t <= maxRadius; t += 0.1) {
      const x = cx + aspect * t * Math.cos(t);
      const y = cy + t * Math.sin(t);
      const x0 = x - boxW / 2;
      const y0 = y - boxH / 2;
      const x1 = x + boxW / 2;
      const y1 = y + boxH / 2;
      if (x0 < 0 || y0 < 0 || x1 > width || y1 > height) continue;
      if (isFree(x0, y0, x1, y1)) {
        occupy(x0, y0, x1, y1);
        placed.push({ ...word, x, y });
        return;
      }
    }
  });
  return placed;
}

const ACTIVE_INTERACTIONS = ['element-active', 'element-highlight', 'element-highlight-by-color'];

export function WordCloud({
  data,
  wordField,
  weightField,
  colorField,
  color,
  wordStyle: wordStyleProp,
  tooltip,
  interactions,
  height,
  width,
  autoFit,
  padding,
  appendPadding,
  className,
  style,
}) {
  const wordStyle = React.useMemo(() => wordStyleProp || {}, [wordStyleProp]);
  const textField = fieldName(wordField);
  const valueField = fieldName(weightField);
  const hueField = fieldName(colorField);
  const [measureRef, measuredWidth] = useElementWidth();
  const [fontFamily, setFontFamily] = React.useState('sans-serif');
  const [fontsVersion, setFontsVersion] = React.useState(0);
  const [active, setActive] = React.useState(null);
  const [pointer, setPointer] = React.useState({ x: 0, y: 0 });

  // Measure with the font the text renders in (Satoshi), again once web fonts are ready.
  React.useLayoutEffect(() => {
    const element = measureRef.current;
    if (element && typeof window !== 'undefined' && window.getComputedStyle) {
      setFontFamily(
        wordStyle.fontFamily || window.getComputedStyle(element).fontFamily || 'sans-serif'
      );
    }
  }, [measureRef, wordStyle.fontFamily]);
  React.useEffect(() => {
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) setFontsVersion(v => v + 1);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const chartHeight = toNumber(height) ?? DEFAULT_HEIGHT;
  const chartWidth = autoFit === false && toNumber(width) ? toNumber(width) : measuredWidth;
  const pad = Array.isArray(padding) || typeof padding === 'number' ? toBox(padding) : toBox(0);
  const append = toBox(appendPadding);
  const inset = {
    left: pad.left + append.left,
    top: pad.top + append.top,
    width: Math.max(0, chartWidth - pad.left - pad.right - append.left - append.right),
    height: Math.max(0, chartHeight - pad.top - pad.bottom - append.top - append.bottom),
  };

  const words = React.useMemo(() => {
    const list = (Array.isArray(data) ? data : []).filter(
      datum => datum && typeof datum === 'object' && datum[textField] !== undefined
    );
    const weights = list.map(datum => toNumber(datum[valueField]) ?? 0);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const hues = hueField ? uniqueInOrder(list, hueField) : null;
    const sizeOption = wordStyle.fontSize ?? DEFAULT_FONT_SIZE;
    const fontSizeFor = (datum, weight) => {
      if (typeof sizeOption === 'number') return sizeOption;
      if (typeof sizeOption === 'function') return toNumber(sizeOption(datum)) ?? 12;
      const [from, to] = Array.isArray(sizeOption) ? sizeOption : DEFAULT_FONT_SIZE;
      if (max === min) return (from + to) / 2;
      return from + ((weight - min) / (max - min)) * (to - from);
    };
    return list
      .map((datum, index) => {
        const weight = weights[index];
        const hueIndex = hues ? hues.indexOf(datum[hueField]) : index;
        return {
          key: index,
          datum,
          text: String(datum[textField]),
          weight,
          fontSize: Math.max(1, fontSizeFor(datum, weight)),
          fontWeight: wordStyle.fontWeight ?? 500,
          padding: toNumber(wordStyle.padding) ?? DEFAULT_PADDING,
          rotate: rotationFor(wordStyle, index),
          color: resolveColor(color, {
            name: hues ? datum[hueField] : datum[textField],
            index: hueIndex,
            field: hueField || textField,
            datum,
          }),
        };
      })
      .sort((a, b) => b.weight - a.weight || a.key - b.key);
  }, [data, textField, valueField, hueField, wordStyle, color]);

  const placed = React.useMemo(
    () => layoutWords(words, inset.width, inset.height, fontFamily),
    // fontsVersion re-runs the layout once web fonts have loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words, inset.width, inset.height, fontFamily, fontsVersion]
  );

  const tooltipEnabled = tooltip !== false && tooltip !== null;
  const hoverEnabled =
    tooltipEnabled ||
    (Array.isArray(interactions) &&
      interactions.some(interaction => ACTIVE_INTERACTIONS.includes(interaction?.type)));
  const activeWord = active !== null ? placed.find(word => word.key === active) : null;
  const tooltipItem = word => {
    let name = word.text;
    let value = word.weight;
    if (typeof tooltip?.formatter === 'function') {
      const result = tooltip.formatter(word.datum) || {};
      if (result.name !== undefined) name = result.name;
      if (result.value !== undefined) value = result.value;
    }
    return { name, value, color: word.color };
  };

  const handlePointer = (event, key) => {
    if (!hoverEnabled) return;
    const rect = measureRef.current?.getBoundingClientRect();
    if (rect) setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (key !== active) setActive(key);
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
            className="block animate-in duration-300 ease-out-quad fade-in-0"
            role="img"
          >
            <g transform={`translate(${inset.left},${inset.top})`}>
              {placed.map(word => (
                <text
                  key={word.key}
                  transform={`translate(${word.x},${word.y})${word.rotate ? ` rotate(${word.rotate})` : ''}`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={word.fontSize}
                  fontWeight={word.fontWeight}
                  fill={word.color}
                  className={cn('select-none', hoverEnabled && 'cursor-default')}
                  style={{ fontFamily: wordStyle.fontFamily }}
                  onMouseMove={event => handlePointer(event, word.key)}
                  onMouseEnter={event => handlePointer(event, word.key)}
                >
                  {word.text}
                </text>
              ))}
            </g>
          </svg>
        )}
        {tooltipEnabled && (
          <TooltipBox
            visible={!!activeWord}
            x={pointer.x}
            y={pointer.y}
            containerWidth={chartWidth}
            title={null}
            items={activeWord ? [tooltipItem(activeWord)] : []}
          />
        )}
      </div>
    </div>
  );
}
