import React, { useRef, useState } from 'react';
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
import { InputGroupAddon } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

const CREATE_VALUE = '__create__';

/**
 * A searchable single select over `{ value, label }` options (companies, teams).
 *
 * - `onSearch(query)`: the list is filtered on the server; typing reports the query and the
 *   options are shown as they come back. Without it the options are filtered here.
 * - `onCreate(name)`: offers "Create “name”" when the typed name isn't in the list. It should
 *   resolve to the new option's value, which is then selected.
 * - `unknownLabel`: shown for a value that isn't among the options (never the raw id).
 * - `allowClear`: shows a clear button while something is selected (`onValueChange(undefined)`).
 *
 * Works inside a FormField (`value` + `onValueChange`).
 */
function OptionCombobox({
  options = [],
  value,
  onValueChange,
  onSearch,
  onCreate,
  isCreating = false,
  loading = false,
  disabled = false,
  allowClear = false,
  placeholder = 'Select',
  emptyText = 'No results found.',
  unknownLabel = 'Not in the list',
  className,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}) {
  const [query, setQuery] = useState('');
  // Labels of every option seen so far, so a selection stays readable when a server search
  // returns a list without it (or before a freshly created option is fetched).
  const labelsRef = useRef(new Map());
  options.forEach(option => labelsRef.current.set(option.value, option.label));

  const trimmed = query.trim();
  const canCreate =
    Boolean(onCreate) &&
    trimmed.length > 0 &&
    !options.some(option => String(option.label).toLowerCase() === trimmed.toLowerCase());
  const items = canCreate
    ? [...options, { value: CREATE_VALUE, label: trimmed, isCreate: true }]
    : options;

  const hasValue = value !== undefined && value !== null && value !== '';
  const selected = hasValue
    ? (options.find(option => option.value === value) ?? {
        value,
        // Never show a raw id: blank while the list loads, then a plain note.
        label: labelsRef.current.get(value) ?? (loading ? '' : unknownLabel),
      })
    : null;

  const search = next => {
    setQuery(next);
    onSearch?.(next);
  };

  const handleValueChange = async (option, details) => {
    if (details?.reason === 'input-clear') return;
    if (!option) {
      if (allowClear) onValueChange?.(undefined);
      return;
    }
    if (option.isCreate) {
      const name = option.label;
      const createdValue = await onCreate(name);
      if (createdValue !== undefined && createdValue !== null) {
        labelsRef.current.set(createdValue, name);
        onValueChange?.(createdValue);
      }
      search('');
      return;
    }
    onValueChange?.(option.value);
  };

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={handleValueChange}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      // Server-side search: show what the server returned as is.
      filter={onSearch ? null : undefined}
      onInputValueChange={(next, details) => {
        const reason = details?.reason;
        if (reason === 'input-change' || reason === 'input-paste') search(next);
        else if (query) search('');
      }}
      onOpenChange={open => {
        if (!open && query) search('');
      }}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        disabled={disabled}
        showClear={allowClear && hasValue && !disabled}
        className={className ?? 'w-full'}
      >
        {(loading || isCreating) && (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        )}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {option =>
            option.isCreate ? (
              <ComboboxItem key={CREATE_VALUE} value={option} disabled={isCreating}>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="text-primary" />
                <span className="min-w-0 truncate">Create “{option.label}”</span>
              </ComboboxItem>
            ) : (
              <ComboboxItem key={option.value} value={option} disabled={option.disabled}>
                <span className="min-w-0 truncate">{option.label}</span>
              </ComboboxItem>
            )
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

OptionCombobox.formBinding = 'valueChange';

export default OptionCombobox;
