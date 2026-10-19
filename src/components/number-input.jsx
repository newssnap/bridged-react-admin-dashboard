import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

/**
 * Numeric input on the shadcn InputGroup.
 *
 * Value semantics:
 * - `onChange(value: number | null)` fires while typing when the text parses to a number
 *   inside [min, max] (out-of-range typing does not fire); on blur / Enter the text is
 *   re-validated: out-of-range values are clamped (`changeOnBlur`, default true), invalid text
 *   reverts to the last valid value, and empty text gives `onChange(null)`.
 * - `precision` (or the precision of `step` / the value) formats the shown and emitted value;
 *   `1.` is not reformatted while the user is typing.
 * - Stepping (buttons with press-and-hold repeat, ArrowUp / ArrowDown, Shift = x10) clamps
 *   to [min, max] and calls `onStep(value, { offset, type, emitter })`.
 * - `formatter(value, { userTyping, input })` / `parser(text)`, `decimalSeparator`,
 *   `stringMode` (emit strings), `keyboard`, `changeOnWheel`, `onPressEnter`, `onInput`.
 *
 * Layout: `prefix` / `suffix` render as InputGroup addons (units such as "px" or "days"),
 * `controls={false}` hides the step buttons, `className` styles the group and
 * `inputClassName` the `<input>`. Other props (id, name, placeholder, aria-*, ref, autoFocus,
 * onFocus, onBlur, onKeyDown, ...) go to the `<input>`.
 */

/* ------------------------------------------------------------------ */
/* Number utilities (decimal-safe, number mode)    */
/* ------------------------------------------------------------------ */

function isEmptyValue(value) {
  return (!value && value !== 0 && !Number.isNaN(value)) || !String(value).trim();
}

function trimNumber(numStr) {
  let str = numStr.trim();
  let negative = str.startsWith('-');
  if (negative) str = str.slice(1);
  str = str
    .replace(/(\.\d*[^0])0*$/, '$1')
    .replace(/\.0*$/, '')
    .replace(/^0+/, '');
  if (str.startsWith('.')) str = `0${str}`;
  const trimStr = str || '0';
  const splitNumber = trimStr.split('.');
  const integerStr = splitNumber[0] || '0';
  const decimalStr = splitNumber[1] || '0';
  if (integerStr === '0' && decimalStr === '0') negative = false;
  const negativeStr = negative ? '-' : '';
  return {
    negative,
    negativeStr,
    trimStr,
    integerStr,
    decimalStr,
    fullStr: `${negativeStr}${trimStr}`,
  };
}

function isE(number) {
  const str = String(number);
  return !Number.isNaN(Number(str)) && str.includes('e');
}

function validateNumber(num) {
  if (typeof num === 'number') return !Number.isNaN(num);
  if (!num) return false;
  return (
    /^\s*-?\d+(\.\d+)?\s*$/.test(num) || /^\s*-?\d+\.\s*$/.test(num) || /^\s*-?\.\d+\s*$/.test(num)
  );
}

function getNumberPrecision(number) {
  const numStr = String(number);
  if (isE(number)) {
    let precision = Number(numStr.slice(numStr.indexOf('e-') + 2));
    const decimalMatch = numStr.match(/\.(\d+)/);
    if (decimalMatch?.[1]) precision += decimalMatch[1].length;
    return precision;
  }
  return numStr.includes('.') && validateNumber(numStr)
    ? numStr.length - numStr.indexOf('.') - 1
    : 0;
}

function num2str(number) {
  let numStr = String(number);
  if (isE(number)) {
    if (number > Number.MAX_SAFE_INTEGER) return String(Number.MAX_SAFE_INTEGER);
    if (number < Number.MIN_SAFE_INTEGER) return String(Number.MIN_SAFE_INTEGER);
    numStr = number.toFixed(getNumberPrecision(numStr));
  }
  return trimNumber(numStr).fullStr;
}

class NumberDecimal {
  constructor(value) {
    this.origin = '';
    if (isEmptyValue(value)) {
      this.empty = true;
      return;
    }
    this.origin = String(value);
    this.number = Number(value);
  }

  negate() {
    return new NumberDecimal(-this.toNumber());
  }

  add(value) {
    if (this.isInvalidate()) return new NumberDecimal(value);
    const target = Number(value);
    if (Number.isNaN(target)) return this;
    const number = this.number + target;
    if (number > Number.MAX_SAFE_INTEGER) return new NumberDecimal(Number.MAX_SAFE_INTEGER);
    if (number < Number.MIN_SAFE_INTEGER) return new NumberDecimal(Number.MIN_SAFE_INTEGER);
    const maxPrecision = Math.max(getNumberPrecision(this.number), getNumberPrecision(target));
    return new NumberDecimal(number.toFixed(maxPrecision));
  }

  isEmpty() {
    return !!this.empty;
  }

  isNaN() {
    return Number.isNaN(this.number);
  }

  isInvalidate() {
    return this.isEmpty() || this.isNaN();
  }

  equals(target) {
    return this.toNumber() === target?.toNumber();
  }

  lessEquals(target) {
    return this.add(target.negate().toString()).toNumber() <= 0;
  }

  toNumber() {
    return this.number;
  }

  toString(safe = true) {
    if (!safe) return this.origin;
    if (this.isInvalidate()) return '';
    return num2str(this.number);
  }
}

const getMiniDecimal = value => new NumberDecimal(value);

/** Rounds like `Math.round` (1.5 -> 2); `cutOnly` just drops extra decimals. */
function toFixed(numStr, separatorStr, precision, cutOnly = false) {
  if (numStr === '') return '';
  const { negativeStr, integerStr, decimalStr } = trimNumber(numStr);
  const precisionDecimalStr = `${separatorStr}${decimalStr}`;
  const numberWithoutDecimal = `${negativeStr}${integerStr}`;
  if (precision >= 0) {
    const advancedNum = Number(decimalStr[precision]);
    if (advancedNum >= 5 && !cutOnly) {
      const advancedDecimal = getMiniDecimal(numStr).add(
        `${negativeStr}0.${'0'.repeat(precision)}${10 - advancedNum}`
      );
      return toFixed(advancedDecimal.toString(), separatorStr, precision, cutOnly);
    }
    if (precision === 0) return numberWithoutDecimal;
    return `${numberWithoutDecimal}${separatorStr}${decimalStr
      .padEnd(precision, '0')
      .slice(0, precision)}`;
  }
  if (precisionDecimalStr === '.0') return numberWithoutDecimal;
  return `${numberWithoutDecimal}${precisionDecimalStr}`;
}

function getDecupleSteps(step) {
  const stepStr = typeof step === 'number' ? num2str(step) : trimNumber(step).fullStr;
  if (!stepStr.includes('.')) return `${step}0`;
  return trimNumber(stepStr.replace(/(\d)\.(\d)/g, '$1$2.')).fullStr;
}

const getDecimalValue = (stringMode, decimalValue) =>
  stringMode || decimalValue.isEmpty() ? decimalValue.toString() : decimalValue.toNumber();

const getDecimalIfValidate = value => {
  const decimal = getMiniDecimal(value);
  return decimal.isInvalidate() ? null : decimal;
};

/** useLayoutEffect that skips the first mount (StrictMode-safe). */
function useLayoutUpdateEffect(callback, deps) {
  const firstMountRef = React.useRef(true);
  React.useLayoutEffect(() => {
    if (!firstMountRef.current) return callback();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  React.useLayoutEffect(() => {
    firstMountRef.current = false;
    return () => {
      firstMountRef.current = true;
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/* Step buttons (press and hold repeats)                               */
/* ------------------------------------------------------------------ */

const STEP_INTERVAL = 200;
const STEP_DELAY = 600;

function StepButton({ action, disabled, onStep, children }) {
  const isUp = action === 'up';
  const timeoutRef = React.useRef();
  const frameIds = React.useRef([]);
  const stop = () => clearTimeout(timeoutRef.current);

  React.useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
      frameIds.current.forEach(id => cancelAnimationFrame(id));
    },
    []
  );

  const onMouseDown = e => {
    // Keep focus in the input.
    e.preventDefault();
    stop();
    onStep(isUp, 'handler');
    const loop = () => {
      onStep(isUp, 'handler');
      timeoutRef.current = setTimeout(loop, STEP_INTERVAL);
    };
    timeoutRef.current = setTimeout(loop, STEP_DELAY);
  };
  const safeStop = () => frameIds.current.push(requestAnimationFrame(stop));

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={isUp ? 'Increase value' : 'Decrease value'}
      aria-disabled={disabled || undefined}
      data-slot="number-input-step"
      data-action={action}
      onMouseDown={onMouseDown}
      onMouseUp={safeStop}
      onMouseLeave={safeStop}
      className={cn(
        'flex h-1/2 w-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 ease-out-quad select-none hover:bg-foreground/5 hover:text-foreground [&_svg]:size-3',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground'
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* NumberInput                                                         */
/* ------------------------------------------------------------------ */

function NumberInput({
  min,
  max,
  step = 1,
  defaultValue,
  value,
  disabled,
  readOnly,
  keyboard,
  changeOnWheel = false,
  changeOnBlur = true,
  controls = true,
  prefix,
  suffix,
  stringMode,
  parser,
  formatter,
  precision,
  decimalSeparator,
  onChange,
  onInput,
  onPressEnter,
  onStep,
  onFocus,
  onBlur: onBlurProp,
  onKeyDown: onKeyDownProp,
  onKeyUp: onKeyUpProp,
  className,
  inputClassName,
  ref,
  ...restProps
}) {
  const mergedControls = controls && !disabled && !readOnly;

  const [focus, setFocus] = React.useState(false);
  const userTypingRef = React.useRef(false);
  const compositionRef = React.useRef(false);
  const shiftKeyRef = React.useRef(false);
  const inputRef = React.useRef(null);

  const setInputRef = React.useCallback(
    node => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  /* ----------------------------- value ----------------------------- */
  const [decimalValue, setDecimalValue] = React.useState(() =>
    getMiniDecimal(value ?? defaultValue)
  );
  const setUncontrolledDecimalValue = next => {
    if (value === undefined) setDecimalValue(next);
  };

  const getPrecision = React.useCallback(
    (numStr, userTyping) => {
      if (userTyping) return undefined;
      if (precision >= 0) return precision;
      return Math.max(getNumberPrecision(numStr), getNumberPrecision(step));
    },
    [precision, step]
  );

  const mergedParser = React.useCallback(
    num => {
      const numStr = String(num);
      if (parser) return parser(numStr);
      let parsedStr = numStr;
      if (decimalSeparator) parsedStr = parsedStr.replace(decimalSeparator, '.');
      return parsedStr.replace(/[^\w.-]+/g, '');
    },
    [parser, decimalSeparator]
  );

  const inputValueRef = React.useRef('');
  const mergedFormatter = React.useCallback(
    (number, userTyping) => {
      if (formatter) return formatter(number, { userTyping, input: String(inputValueRef.current) });
      let str = typeof number === 'number' ? num2str(number) : number;
      if (!userTyping) {
        const mergedPrecision = getPrecision(str, userTyping);
        if (validateNumber(str) && (decimalSeparator || mergedPrecision >= 0)) {
          str = toFixed(str, decimalSeparator || '.', mergedPrecision);
        }
      }
      return str;
    },
    [formatter, getPrecision, decimalSeparator]
  );

  const [inputValue, setInternalInputValue] = React.useState(() => {
    const initValue = defaultValue ?? value;
    if (decimalValue.isInvalidate() && ['string', 'number'].includes(typeof initValue)) {
      return Number.isNaN(initValue) ? '' : initValue;
    }
    return mergedFormatter(decimalValue.toString(), false);
  });
  inputValueRef.current = inputValue;

  const setInputValue = (newValue, userTyping) => {
    setInternalInputValue(
      mergedFormatter(
        newValue.isInvalidate() ? newValue.toString(false) : newValue.toString(!userTyping),
        userTyping
      )
    );
  };

  const maxDecimal = React.useMemo(() => getDecimalIfValidate(max), [max]);
  const minDecimal = React.useMemo(() => getDecimalIfValidate(min), [min]);

  const upDisabled = React.useMemo(() => {
    if (!maxDecimal || !decimalValue || decimalValue.isInvalidate()) return false;
    return maxDecimal.lessEquals(decimalValue);
  }, [maxDecimal, decimalValue]);
  const downDisabled = React.useMemo(() => {
    if (!minDecimal || !decimalValue || decimalValue.isInvalidate()) return false;
    return decimalValue.lessEquals(minDecimal);
  }, [minDecimal, decimalValue]);

  const getRangeValue = target => {
    if (maxDecimal && !target.lessEquals(maxDecimal)) return maxDecimal;
    if (minDecimal && !minDecimal.lessEquals(target)) return minDecimal;
    return null;
  };
  const isInRange = target => !getRangeValue(target);

  const triggerValueUpdate = (newValue, userTyping) => {
    let updateValue = newValue;
    let isRangeValidate = isInRange(updateValue) || updateValue.isEmpty();
    if (!updateValue.isEmpty() && !userTyping) {
      updateValue = getRangeValue(updateValue) || updateValue;
      isRangeValidate = true;
    }
    if (!readOnly && !disabled && isRangeValidate) {
      const numStr = updateValue.toString();
      const mergedPrecision = getPrecision(numStr, userTyping);
      if (mergedPrecision >= 0) {
        updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision));
        if (!isInRange(updateValue)) {
          updateValue = getMiniDecimal(toFixed(numStr, '.', mergedPrecision, true));
        }
      }
      if (!updateValue.equals(decimalValue)) {
        setUncontrolledDecimalValue(updateValue);
        onChange?.(updateValue.isEmpty() ? null : getDecimalValue(stringMode, updateValue));
        if (value === undefined) setInputValue(updateValue, userTyping);
      }
      return updateValue;
    }
    return decimalValue;
  };

  /* --------------------------- user input -------------------------- */
  const frameRef = React.useRef();
  React.useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const collectInputValue = inputStr => {
    inputValueRef.current = inputStr;
    setInternalInputValue(inputStr);
    if (!compositionRef.current) {
      const finalDecimal = getMiniDecimal(mergedParser(inputStr));
      if (!finalDecimal.isNaN()) triggerValueUpdate(finalDecimal, true);
    }
    onInput?.(inputStr);
    // Full-width full stop -> decimal point.
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const nextInputStr = parser ? inputStr : inputStr.replace(/。/g, '.');
      if (nextInputStr !== inputStr) collectInputValue(nextInputStr);
    });
  };

  const onInternalStep = (up, emitter) => {
    if ((up && upDisabled) || (!up && downDisabled)) return;
    userTypingRef.current = false;
    let stepDecimal = getMiniDecimal(shiftKeyRef.current ? getDecupleSteps(step) : step);
    if (!up) stepDecimal = stepDecimal.negate();
    const target = (decimalValue || getMiniDecimal(0)).add(stepDecimal.toString());
    const updatedValue = triggerValueUpdate(target, false);
    onStep?.(getDecimalValue(stringMode, updatedValue), {
      offset: shiftKeyRef.current ? getDecupleSteps(step) : step,
      type: up ? 'up' : 'down',
      emitter,
    });
    inputRef.current?.focus();
  };
  const onInternalStepRef = React.useRef(onInternalStep);
  onInternalStepRef.current = onInternalStep;
  const stableStep = React.useCallback((up, emitter) => onInternalStepRef.current(up, emitter), []);

  const flushInputValue = userTyping => {
    const parsedValue = getMiniDecimal(mergedParser(inputValue));
    let formatValue;
    if (!parsedValue.isNaN()) formatValue = triggerValueUpdate(parsedValue, userTyping);
    else formatValue = triggerValueUpdate(decimalValue, userTyping);

    if (value !== undefined) setInputValue(decimalValue, false);
    else if (!formatValue.isNaN()) setInputValue(formatValue, false);
  };

  const handleKeyDown = event => {
    const { key, shiftKey } = event;
    userTypingRef.current = true;
    shiftKeyRef.current = shiftKey;
    if (key === 'Enter') {
      if (!compositionRef.current) userTypingRef.current = false;
      flushInputValue(false);
      onPressEnter?.(event);
    }
    if (keyboard !== false && !compositionRef.current) {
      if (['Up', 'ArrowUp', 'Down', 'ArrowDown'].includes(key)) {
        onInternalStep(key === 'Up' || key === 'ArrowUp', 'keyboard');
        event.preventDefault();
      }
    }
    onKeyDownProp?.(event);
  };

  const handleKeyUp = event => {
    userTypingRef.current = false;
    shiftKeyRef.current = false;
    onKeyUpProp?.(event);
  };

  React.useEffect(() => {
    if (!changeOnWheel || !focus) return undefined;
    const input = inputRef.current;
    if (!input) return undefined;
    const onWheel = event => {
      stableStep(event.deltaY < 0, 'wheel');
      event.preventDefault();
    };
    input.addEventListener('wheel', onWheel, { passive: false });
    return () => input.removeEventListener('wheel', onWheel);
  }, [changeOnWheel, focus, stableStep]);

  const handleBlur = event => {
    if (changeOnBlur) flushInputValue(false);
    setFocus(false);
    userTypingRef.current = false;
    onBlurProp?.(event);
  };

  /* -------------------------- controlled --------------------------- */
  useLayoutUpdateEffect(() => {
    if (!decimalValue.isInvalidate()) setInputValue(decimalValue, false);
  }, [precision, formatter]);

  useLayoutUpdateEffect(() => {
    const newValue = getMiniDecimal(value);
    setDecimalValue(newValue);
    const currentParsedValue = getMiniDecimal(mergedParser(inputValue));
    if (!newValue.equals(currentParsedValue) || !userTypingRef.current || formatter) {
      setInputValue(newValue, userTypingRef.current);
    }
  }, [value]);

  /* ----------------------------- render ---------------------------- */
  return (
    <InputGroup
      data-slot="number-input"
      data-disabled={disabled || undefined}
      className={className}
    >
      {prefix !== undefined && prefix !== null && <InputGroupAddon>{prefix}</InputGroupAddon>}
      <InputGroupInput
        autoComplete="off"
        role="spinbutton"
        inputMode="decimal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={decimalValue.isInvalidate() ? undefined : decimalValue.toString()}
        step={step}
        {...restProps}
        ref={setInputRef}
        className={cn('tabular-nums', inputClassName)}
        value={inputValue}
        onChange={e => collectInputValue(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        onFocus={event => {
          setFocus(true);
          onFocus?.(event);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onCompositionStart={() => {
          compositionRef.current = true;
        }}
        onCompositionEnd={event => {
          compositionRef.current = false;
          collectInputValue(event.currentTarget.value);
        }}
        onBeforeInput={() => {
          userTypingRef.current = true;
        }}
      />
      {suffix !== undefined && suffix !== null && (
        <InputGroupAddon align="inline-end">{suffix}</InputGroupAddon>
      )}
      {mergedControls && (
        <InputGroupAddon
          align="inline-end"
          data-slot="number-input-controls"
          className="flex-col gap-0 self-stretch py-0.5 pe-1 opacity-0 transition-opacity duration-150 ease-out-quad group-hover/input-group:opacity-100 group-focus-within/input-group:opacity-100"
        >
          <StepButton action="up" disabled={upDisabled} onStep={stableStep}>
            <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
          </StepButton>
          <StepButton action="down" disabled={downDisabled} onStep={stableStep}>
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
          </StepButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { NumberInput };
