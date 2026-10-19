import React, { useMemo } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { toComboboxValue } from '@/lib/combobox';
import { hasValue } from '../utils/creditFormat';

const matches = (item, query) =>
  `${item.label} ${item.companyName}`.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Searchable team picker (name or company). Stores the team id. Use as the render-function
 * child of a `FormField bind="valueChange"`: `{control => <TeamCombobox control={control} … />}`.
 */
function TeamCombobox({ teams, control, onChange, disabled, placeholder = 'Search teams' }) {
  const items = useMemo(
    () =>
      (teams ?? [])
        .filter(team => team?.teamId !== undefined && team?.teamId !== null)
        .map(team => ({
          value: team.teamId,
          label: hasValue(team.teamName) ? team.teamName : 'Unnamed team',
          companyName: hasValue(team.companyName) ? team.companyName : '',
        })),
    [teams]
  );

  return (
    <Combobox
      items={items}
      value={toComboboxValue(items, control.value)}
      onValueChange={(option, { reason }) => {
        if (reason === 'input-clear') return;
        control.onValueChange(option?.value);
        onChange?.(option?.value);
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
      filter={matches}
      disabled={disabled}
    >
      <ComboboxInput
        id={control.id}
        aria-invalid={control['aria-invalid']}
        aria-describedby={control['aria-describedby']}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>No teams found.</ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={option.value} value={option}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                {option.companyName && (
                  <span className="truncate text-xs text-muted-foreground">
                    {option.companyName}
                  </span>
                )}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default TeamCombobox;
