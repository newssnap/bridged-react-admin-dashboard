/**
 * Resolves a stored select value to the option object a Combobox expects. A value that isn't
 * among the options is still shown, as `{ value, label: String(value) }` (like the previous
 * select did); empty values (undefined, null, '') resolve to null.
 */
export const toComboboxValue = (options, value) =>
  (options ?? []).find(option => option.value === value) ??
  (value !== undefined && value !== null && value !== '' ? { value, label: String(value) } : null);
