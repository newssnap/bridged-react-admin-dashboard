import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Spinner } from '@/components/ui/spinner';

/**
 * Multiple / creatable ("tags") select built on the shadcn Combobox chips pattern.
 *
 * - `options`: `{ value, label, disabled?, title? }[]`. Values may be any primitive
 *   (string, number, boolean); they are emitted unchanged.
 * - `value` (controlled) / `defaultValue`: array of option values, in selection order.
 * - `onValueChange(values, options)`: the next values (new picks appended) and the matching
 *   option objects (`{ value, label }` for created / unknown values).
 * - `creatable`: typed text can be added as a value (Enter, or `separators`).
 * - `separators`: e.g. `[',', ' ']` — typing or pasting text containing one of them adds
 *   every non-empty token.
 * - `maxChips`: a number, or `'responsive'` to keep the chips on one line and show "+N".
 * - `header` / `footer`: content rendered above / below the option list inside the popup.
 * - `popup`: replaces the option list entirely (custom popup body).
 * - `inputValue` / `onInputValueChange`, `open` / `onOpenChange`, `onInputKeyDown`.
 */

const searchTextOf = option =>
  typeof option.label === 'string' || typeof option.label === 'number'
    ? String(option.label)
    : String(option.title ?? option.value ?? '');

const isSameItem = (a, b) => a?.value === b?.value;

function useControllable(prop, defaultValue, onChange) {
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : inner;
  const setValue = React.useCallback(
    (next, ...rest) => {
      if (!isControlled) setInner(next);
      onChange?.(next, ...rest);
    },
    [isControlled, onChange]
  );
  return [value, setValue];
}

/** How many chips fit on the first line of the chips row (responsive mode). */
function useResponsiveCount(enabled, containerRef, deps) {
  const [count, setCount] = React.useState(null);

  React.useLayoutEffect(() => {
    if (enabled) setCount(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  React.useLayoutEffect(() => {
    if (!enabled || count !== null) return;
    const container = containerRef.current;
    if (!container) return;
    const chips = [...container.querySelectorAll('[data-slot=combobox-chip]')];
    if (chips.length < 2) return;
    const firstTop = chips[0].offsetTop;
    const fitting = chips.filter(chip => chip.offsetTop === firstTop).length;
    // Leave room for the "+N" chip when some chips wrap.
    if (fitting < chips.length) setCount(Math.max(1, fitting - 1));
  }, [enabled, count, containerRef]);

  React.useEffect(() => {
    if (!enabled || typeof ResizeObserver === 'undefined') return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    let width = container.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (container.offsetWidth !== width) {
        width = container.offsetWidth;
        setCount(null);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [enabled, containerRef]);

  return enabled ? count : null;
}

function MultiSelect({
  options,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  placeholder,
  creatable = false,
  separators,
  maxChips,
  emptyText = 'No results found.',
  header,
  footer,
  popup,
  loading = false,
  allowClear = false,
  disabled = false,
  size = 'default',
  open,
  onOpenChange,
  inputValue: inputValueProp,
  onInputValueChange,
  onInputKeyDown,
  className,
  contentClassName,
  id,
  'aria-invalid': ariaInvalid,
}) {
  const anchor = useComboboxAnchor();
  const [values, setValues] = useControllable(valueProp, defaultValue, onValueChange);
  const [query, setQuery] = useControllable(inputValueProp, '', onInputValueChange);
  const selectedValues = React.useMemo(() => values ?? [], [values]);

  const optionList = React.useMemo(() => options ?? [], [options]);
  const optionByValue = React.useMemo(() => {
    const map = new Map();
    optionList.forEach(option => map.set(option.value, option));
    return map;
  }, [optionList]);

  const selectedItems = React.useMemo(
    () =>
      selectedValues.map(
        selected => optionByValue.get(selected) ?? { value: selected, label: String(selected) }
      ),
    [selectedValues, optionByValue]
  );

  const trimmedQuery = (query ?? '').trim();
  const items = React.useMemo(() => {
    const extra = selectedItems.filter(item => !optionByValue.has(item.value));
    const list = [...optionList, ...extra];
    if (
      creatable &&
      trimmedQuery &&
      !list.some(item => item.value === trimmedQuery || searchTextOf(item) === trimmedQuery)
    ) {
      list.unshift({ value: trimmedQuery, label: trimmedQuery });
    }
    return list;
  }, [optionList, selectedItems, optionByValue, creatable, trimmedQuery]);

  const emit = nextItems => {
    const nextOptions = nextItems.map(item =>
      optionByValue.has(item.value) ? optionByValue.get(item.value) : item
    );
    setValues(
      nextOptions.map(item => item.value),
      nextOptions
    );
  };

  const addTokens = tokens => {
    const known = new Set(selectedValues);
    const additions = [];
    tokens.forEach(token => {
      const match = optionList.find(o => o.value === token || searchTextOf(o) === token);
      const item = match ?? { value: token, label: token };
      if (!known.has(item.value) && !match?.disabled) {
        known.add(item.value);
        additions.push(item);
      }
    });
    if (additions.length) emit([...selectedItems, ...additions]);
  };

  const handleInputValueChange = (text, details) => {
    if (separators?.length && creatable && separators.some(sep => text.includes(sep))) {
      const pattern = new RegExp(
        `[${separators.map(sep => sep.replace(/[\\\]^-]/g, '\\$&')).join('')}]`
      );
      addTokens(
        text
          .split(pattern)
          .map(token => token.trim())
          .filter(Boolean)
      );
      setQuery('', details);
      return;
    }
    setQuery(text, details);
  };

  const chipsRef = React.useRef(null);
  const responsiveCount = useResponsiveCount(maxChips === 'responsive', chipsRef, [
    selectedValues.length,
  ]);
  const chipLimit = typeof maxChips === 'number' ? maxChips : responsiveCount;
  const visibleItems = chipLimit == null ? selectedItems : selectedItems.slice(0, chipLimit);
  const hiddenCount = selectedItems.length - visibleItems.length;

  const setChipsRef = node => {
    chipsRef.current = node;
    anchor.current = node;
  };

  return (
    <Combobox
      multiple
      autoHighlight={creatable}
      items={items}
      value={selectedItems}
      onValueChange={next => {
        emit(next);
        setQuery('');
      }}
      isItemEqualToValue={isSameItem}
      itemToStringLabel={searchTextOf}
      itemToStringValue={item => String(item.value)}
      filter={(item, text) =>
        !text || searchTextOf(item).toLowerCase().includes(String(text).toLowerCase())
      }
      inputValue={query}
      onInputValueChange={handleInputValueChange}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <ComboboxChips
        ref={setChipsRef}
        data-size={size}
        className={cn(
          'w-full data-[size=sm]:min-h-8',
          maxChips === 'responsive' && 'flex-nowrap overflow-hidden',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <ComboboxValue>
          {() => (
            <>
              {visibleItems.map(item => (
                <ComboboxChip key={String(item.value)} className="max-w-full shrink-0">
                  <span className="truncate">{item.label}</span>
                </ComboboxChip>
              ))}
              {hiddenCount > 0 && (
                <span
                  data-slot="combobox-chip-overflow"
                  className="flex h-5.5 shrink-0 items-center rounded-sm bg-input px-2 text-xs font-medium text-muted-foreground dark:bg-input/60"
                >
                  +{hiddenCount}
                </span>
              )}
              <ComboboxChipsInput
                id={id}
                aria-invalid={ariaInvalid}
                placeholder={selectedItems.length ? undefined : placeholder}
                onKeyDown={onInputKeyDown}
                className="min-w-12 bg-transparent placeholder:text-muted-foreground"
              />
            </>
          )}
        </ComboboxValue>
        {loading && <Spinner className="ms-auto shrink-0 text-muted-foreground" />}
        {allowClear && !disabled && selectedItems.length > 0 && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => emit([])}
            className="ms-auto flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 ease-out-quad hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
          </button>
        )}
      </ComboboxChips>
      <ComboboxContent anchor={anchor} className={contentClassName}>
        {header}
        {popup ?? (
          <>
            <ComboboxEmpty>{emptyText}</ComboboxEmpty>
            <ComboboxList>
              {item => (
                <ComboboxItem key={String(item.value)} value={item} disabled={item.disabled}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </>
        )}
        {footer}
      </ComboboxContent>
    </Combobox>
  );
}

export { MultiSelect };
