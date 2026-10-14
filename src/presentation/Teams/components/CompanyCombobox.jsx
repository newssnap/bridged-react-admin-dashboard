import React, { useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
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

/**
 * Company picker with server-side search. When the search finds nothing, the empty state
 * offers to create a company with the typed name, and selects it once it exists.
 */
function CompanyCombobox({
  id,
  value,
  onValueChange,
  options,
  loading = false,
  searchText,
  onSearch,
  onCreate,
  isCreating = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}) {
  const [open, setOpen] = useState(false);
  // Remember every company we have seen, so the picked one keeps its name while a search
  // narrows the options.
  const knownRef = useRef(new Map());
  (options ?? []).forEach(option => knownRef.current.set(option.value, option));
  const selected = knownRef.current.get(value) ?? toComboboxValue(options, value);

  const trimmedSearch = searchText?.trim();

  const handleCreate = async () => {
    const createdCompanyId = await onCreate?.({ name: searchText ?? '' });
    if (!createdCompanyId) return;
    knownRef.current.set(createdCompanyId, { value: createdCompanyId, label: trimmedSearch });
    onValueChange?.(createdCompanyId);
    setOpen(false);
  };

  return (
    <Combobox
      items={options ?? []}
      value={selected ?? null}
      filter={null}
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) onSearch?.('');
      }}
      onValueChange={(option, details) => {
        if (details?.reason === 'input-clear') return;
        onValueChange?.(option?.value ?? undefined);
      }}
      onInputValueChange={(text, details) => {
        const reason = details?.reason;
        if (reason === 'input-change' || reason === 'input-paste' || reason === 'input-clear') {
          onSearch?.(text);
        }
      }}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
    >
      <ComboboxInput
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        placeholder="Select a company"
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
        <ComboboxEmpty>
          {!loading && trimmedSearch ? (
            <div className="flex flex-col items-center gap-3 px-3 py-4 text-center">
              <p className="text-sm">No companies match “{trimmedSearch}”</p>
              <Button type="button" size="sm" onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                )}
                Create “{trimmedSearch}”
              </Button>
            </div>
          ) : loading ? (
            'Loading companies…'
          ) : (
            'No companies found.'
          )}
        </ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default CompanyCombobox;
