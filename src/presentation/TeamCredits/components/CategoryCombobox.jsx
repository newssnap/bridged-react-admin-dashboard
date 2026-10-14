import React, { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { toComboboxValue } from '@/lib/combobox';

/**
 * Category picker that can add a category: typing a name that isn't listed offers
 * "Add “…”", which adds it to the options (`onAddOption(name)`) and selects it.
 * Render-function child of a `FormField bind="valueChange"`.
 */
function CategoryCombobox({ options, onAddOption, control }) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();

  const items = useMemo(() => {
    const known =
      !trimmed ||
      options.some(
        option =>
          option.value.toLowerCase() === trimmed.toLowerCase() ||
          option.label.toLowerCase() === trimmed.toLowerCase()
      );
    return known ? options : [...options, { value: trimmed, label: trimmed, isNew: true }];
  }, [options, trimmed]);

  return (
    <Combobox
      items={items}
      value={toComboboxValue(options, control.value)}
      onInputValueChange={value => setQuery(value ?? '')}
      onValueChange={(option, { reason }) => {
        if (reason === 'input-clear') return;
        if (option?.isNew) onAddOption(option.value);
        control.onValueChange(option?.value);
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxInput
        id={control.id}
        aria-invalid={control['aria-invalid']}
        aria-describedby={control['aria-describedby']}
        placeholder="Choose or type a new category"
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>Type a name to add a category.</ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={`${option.isNew ? 'new:' : ''}${option.value}`} value={option}>
              {option.isNew ? (
                <span className="flex min-w-0 items-center gap-2">
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4 shrink-0" />
                  <span className="truncate">Add “{option.label}”</span>
                </span>
              ) : (
                option.label
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default CategoryCombobox;
