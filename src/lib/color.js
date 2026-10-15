/**
 * Minimal replacement for `FastColor` from @ant-design/fast-color (v3.0.1), covering what
 * the app uses: `new FastColor(input)`, `setA(alpha)`, `toRgbString()` (plus `toString`,
 * `toHexString`, `toRgb`, `clone`). Parsing and output are ported from fast-color, so
 * results are identical: hex (#rgb, #rgba, #rrggbb, #rrggbbaa), rgb()/rgba(), hsl()/hsla(),
 * hsv()/hsb(), CSS named colours, `{ r, g, b, a }` / `{ h, s, l, a }` / `{ h, s, v, a }`
 * objects and FastColor instances.
 */

const round = Math.round;

// CSS named colours as base-36 encoded RGB (same table as fast-color).
const PRESET_COLORS = {
  aliceblue: '9ehhb',
  antiquewhite: '9sgk7',
  aqua: '1ekf',
  aquamarine: '4zsno',
  azure: '9eiv3',
  beige: '9lhp8',
  bisque: '9zg04',
  black: '0',
  blanchedalmond: '9zhe5',
  blue: '73',
  blueviolet: '5e31e',
  brown: '6g016',
  burlywood: '8ouiv',
  cadetblue: '3qba8',
  chartreuse: '4zshs',
  chocolate: '87k0u',
  coral: '9yvyo',
  cornflowerblue: '3xael',
  cornsilk: '9zjz0',
  crimson: '8l4xo',
  cyan: '1ekf',
  darkblue: '3v',
  darkcyan: 'rkb',
  darkgoldenrod: '776yz',
  darkgray: '6mbhl',
  darkgreen: 'jr4',
  darkgrey: '6mbhl',
  darkkhaki: '7ehkb',
  darkmagenta: '5f91n',
  darkolivegreen: '3bzfz',
  darkorange: '9yygw',
  darkorchid: '5z6x8',
  darkred: '5f8xs',
  darksalmon: '9441m',
  darkseagreen: '5lwgf',
  darkslateblue: '2th1n',
  darkslategray: '1ugcv',
  darkslategrey: '1ugcv',
  darkturquoise: '14up',
  darkviolet: '5rw7n',
  deeppink: '9yavn',
  deepskyblue: '11xb',
  dimgray: '442g9',
  dimgrey: '442g9',
  dodgerblue: '16xof',
  firebrick: '6y7tu',
  floralwhite: '9zkds',
  forestgreen: '1cisi',
  fuchsia: '9y70f',
  gainsboro: '8m8kc',
  ghostwhite: '9pq0v',
  goldenrod: '8j4f4',
  gold: '9zda8',
  gray: '50i2o',
  green: 'pa8',
  greenyellow: '6senj',
  grey: '50i2o',
  honeydew: '9eiuo',
  hotpink: '9yrp0',
  indianred: '80gnw',
  indigo: '2xcoy',
  ivory: '9zldc',
  khaki: '9edu4',
  lavenderblush: '9ziet',
  lavender: '90c8q',
  lawngreen: '4vk74',
  lemonchiffon: '9zkct',
  lightblue: '6s73a',
  lightcoral: '9dtog',
  lightcyan: '8s1rz',
  lightgoldenrodyellow: '9sjiq',
  lightgray: '89jo3',
  lightgreen: '5nkwg',
  lightgrey: '89jo3',
  lightpink: '9z6wx',
  lightsalmon: '9z2ii',
  lightseagreen: '19xgq',
  lightskyblue: '5arju',
  lightslategray: '4nwk9',
  lightslategrey: '4nwk9',
  lightsteelblue: '6wau6',
  lightyellow: '9zlcw',
  lime: '1edc',
  limegreen: '1zcxe',
  linen: '9shk6',
  magenta: '9y70f',
  maroon: '4zsow',
  mediumaquamarine: '40eju',
  mediumblue: '5p',
  mediumorchid: '79qkz',
  mediumpurple: '5r3rv',
  mediumseagreen: '2d9ip',
  mediumslateblue: '4tcku',
  mediumspringgreen: '1di2',
  mediumturquoise: '2uabw',
  mediumvioletred: '7rn9h',
  midnightblue: 'z980',
  mintcream: '9ljp6',
  mistyrose: '9zg0x',
  moccasin: '9zfzp',
  navajowhite: '9zest',
  navy: '3k',
  oldlace: '9wq92',
  olive: '50hz4',
  olivedrab: '472ub',
  orange: '9z3eo',
  orangered: '9ykg0',
  orchid: '8iu3a',
  palegoldenrod: '9bl4a',
  palegreen: '5yw0o',
  paleturquoise: '6v4ku',
  palevioletred: '8k8lv',
  papayawhip: '9zi6t',
  peachpuff: '9ze0p',
  peru: '80oqn',
  pink: '9z8wb',
  plum: '8nba5',
  powderblue: '6wgdi',
  purple: '4zssg',
  rebeccapurple: '3zk49',
  red: '9y6tc',
  rosybrown: '7cv4f',
  royalblue: '2jvtt',
  saddlebrown: '5fmkz',
  salmon: '9rvci',
  sandybrown: '9jn1c',
  seagreen: '1tdnb',
  seashell: '9zje6',
  sienna: '6973h',
  silver: '7ir40',
  skyblue: '5arjf',
  slateblue: '45e4t',
  slategray: '4e100',
  slategrey: '4e100',
  snow: '9zke2',
  springgreen: '1egv',
  steelblue: '2r1kk',
  tan: '87yx8',
  teal: 'pds',
  thistle: '8ggk8',
  tomato: '9yqfb',
  turquoise: '2j4r4',
  violet: '9b10u',
  wheat: '9ld4j',
  white: '9zldr',
  whitesmoke: '9lhpx',
  yellow: '9zl6o',
  yellowgreen: '61fzm',
};

/** Splits `rgb(...)` / `hsl(...)` strings into [c0, c1, c2, alpha]. */
function splitColorStr(str, parseNum) {
  const match =
    str
      .replace(/^[^(]*\((.*)/, '$1')
      .replace(/\).*/, '')
      .match(/\d*\.?\d+%?/g) || [];
  const numList = match.map(item => parseFloat(item));
  for (let i = 0; i < 3; i += 1) {
    numList[i] = parseNum(numList[i] || 0, match[i] || '', i);
  }
  if (match[3]) {
    numList[3] = match[3].includes('%') ? numList[3] / 100 : numList[3];
  } else {
    numList[3] = 1;
  }
  return numList;
}

const parseHSVorHSL = (num, _, index) => (index === 0 ? num : num / 100);

function limitRange(value, max) {
  const mergedMax = max || 255;
  if (value > mergedMax) return mergedMax;
  if (value < 0) return 0;
  return value;
}

export class FastColor {
  isValid = true;
  r = 0;
  g = 0;
  b = 0;
  a = 1;

  constructor(input) {
    const matchFormat = str => str[0] in input && str[1] in input && str[2] in input;
    if (!input) {
      // Black, fully opaque.
    } else if (typeof input === 'string') {
      const trimStr = input.trim();
      if (/^#?[A-F\d]{3,8}$/i.test(trimStr)) {
        this.fromHexString(trimStr);
      } else if (trimStr.startsWith('rgb')) {
        this.fromRgbString(trimStr);
      } else if (trimStr.startsWith('hsl')) {
        this.fromHslString(trimStr);
      } else if (trimStr.startsWith('hsv') || trimStr.startsWith('hsb')) {
        this.fromHsvString(trimStr);
      } else {
        const presetColor = PRESET_COLORS[trimStr.toLowerCase()];
        if (presetColor) {
          this.fromHexString(parseInt(presetColor, 36).toString(16).padStart(6, '0'));
        }
      }
    } else if (input instanceof FastColor) {
      this.r = input.r;
      this.g = input.g;
      this.b = input.b;
      this.a = input.a;
    } else if (matchFormat('rgb')) {
      this.r = limitRange(input.r);
      this.g = limitRange(input.g);
      this.b = limitRange(input.b);
      this.a = typeof input.a === 'number' ? limitRange(input.a, 1) : 1;
    } else if (matchFormat('hsl')) {
      this.fromHsl(input);
    } else if (matchFormat('hsv')) {
      this.fromHsv(input);
    } else {
      throw new Error('@ant-design/fast-color: unsupported input ' + JSON.stringify(input));
    }
  }

  // ----- setters (return a new instance) -----
  setA(value) {
    const clone = this.clone();
    clone.a = limitRange(value, 1);
    return clone;
  }

  clone() {
    return new this.constructor(this);
  }

  // ----- output -----
  toRgb() {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }

  toRgbString() {
    return this.a !== 1
      ? `rgba(${this.r},${this.g},${this.b},${this.a})`
      : `rgb(${this.r},${this.g},${this.b})`;
  }

  toString() {
    return this.toRgbString();
  }

  toHexString() {
    const hex2 = value => {
      const str = (value || 0).toString(16);
      return str.length === 2 ? str : '0' + str;
    };
    let hex = '#' + hex2(this.r) + hex2(this.g) + hex2(this.b);
    if (typeof this.a === 'number' && this.a >= 0 && this.a < 1) {
      hex += hex2(round(this.a * 255));
    }
    return hex;
  }

  // ----- parsing -----
  fromHexString(trimStr) {
    const withoutPrefix = trimStr.replace('#', '');
    const connectNum = (index1, index2) =>
      parseInt(withoutPrefix[index1] + withoutPrefix[index2 || index1], 16);
    if (withoutPrefix.length < 6) {
      this.r = connectNum(0);
      this.g = connectNum(1);
      this.b = connectNum(2);
      this.a = withoutPrefix[3] ? connectNum(3) / 255 : 1;
    } else {
      this.r = connectNum(0, 1);
      this.g = connectNum(2, 3);
      this.b = connectNum(4, 5);
      this.a = withoutPrefix[6] ? connectNum(6, 7) / 255 : 1;
    }
  }

  fromHsl({ h: rawH, s, l, a }) {
    const h = ((rawH % 360) + 360) % 360;
    this.a = typeof a === 'number' ? a : 1;
    if (s <= 0) {
      const rgb = round(l * 255);
      this.r = rgb;
      this.g = rgb;
      this.b = rgb;
      return;
    }
    let r = 0;
    let g = 0;
    let b = 0;
    const huePrime = h / 60;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
    if (huePrime >= 0 && huePrime < 1) {
      r = chroma;
      g = secondComponent;
    } else if (huePrime >= 1 && huePrime < 2) {
      r = secondComponent;
      g = chroma;
    } else if (huePrime >= 2 && huePrime < 3) {
      g = chroma;
      b = secondComponent;
    } else if (huePrime >= 3 && huePrime < 4) {
      g = secondComponent;
      b = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
      r = secondComponent;
      b = chroma;
    } else if (huePrime >= 5 && huePrime < 6) {
      r = chroma;
      b = secondComponent;
    }
    const lightnessModification = l - chroma / 2;
    this.r = round((r + lightnessModification) * 255);
    this.g = round((g + lightnessModification) * 255);
    this.b = round((b + lightnessModification) * 255);
  }

  fromHsv({ h: rawH, s, v, a }) {
    const h = ((rawH % 360) + 360) % 360;
    this.a = typeof a === 'number' ? a : 1;
    const vv = round(v * 255);
    this.r = vv;
    this.g = vv;
    this.b = vv;
    if (s <= 0) return;
    const hh = h / 60;
    const i = Math.floor(hh);
    const ff = hh - i;
    const p = round(v * (1.0 - s) * 255);
    const q = round(v * (1.0 - s * ff) * 255);
    const t = round(v * (1.0 - s * (1.0 - ff)) * 255);
    switch (i) {
      case 0:
        this.g = t;
        this.b = p;
        break;
      case 1:
        this.r = q;
        this.b = p;
        break;
      case 2:
        this.r = p;
        this.b = t;
        break;
      case 3:
        this.r = p;
        this.g = q;
        break;
      case 4:
        this.r = t;
        this.g = p;
        break;
      case 5:
      default:
        this.g = p;
        this.b = q;
        break;
    }
  }

  fromHsvString(trimStr) {
    const cells = splitColorStr(trimStr, parseHSVorHSL);
    this.fromHsv({ h: cells[0], s: cells[1], v: cells[2], a: cells[3] });
  }

  fromHslString(trimStr) {
    const cells = splitColorStr(trimStr, parseHSVorHSL);
    this.fromHsl({ h: cells[0], s: cells[1], l: cells[2], a: cells[3] });
  }

  fromRgbString(trimStr) {
    const cells = splitColorStr(trimStr, (num, txt) =>
      txt.includes('%') ? round((num / 100) * 255) : num
    );
    this.r = cells[0];
    this.g = cells[1];
    this.b = cells[2];
    this.a = cells[3];
  }
}

export default FastColor;
