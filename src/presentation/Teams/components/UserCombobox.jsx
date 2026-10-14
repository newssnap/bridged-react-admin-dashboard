import React from 'react';
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
import { toComboboxValue } from '@/lib/combobox';

/** Single user picker: options are `{ value, label, fullname, email }`, searched by label. */
function UserCombobox({
  id,
  value,
  onValueChange,
  options,
  loading = false,
  placeholder = 'Select a user',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}) {
  const selected = toComboboxValue(options, value);

  return (
    <Combobox
      items={options ?? []}
      value={selected}
      onValueChange={(option, details) => {
        if (details?.reason === 'input-clear') return;
        onValueChange?.(option?.value ?? undefined);
      }}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
    >
      <ComboboxInput
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        className="w-full"
        showClear={!!selected}
      >
        {loading && (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        )}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>{loading ? 'Loading users…' : 'No users found.'}</ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={option.value} value={option}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.fullname || option.email || option.label}</span>
                {option.fullname && option.email ? (
                  <span className="truncate text-xs text-muted-foreground">{option.email}</span>
                ) : null}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default UserCombobox;
