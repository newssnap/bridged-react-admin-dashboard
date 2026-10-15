/**
 * Custom work statuses: one map for the whole feature (labels and Badge tones per §5).
 * `pending` is what the form calls "In execution".
 */
export const CUSTOM_WORK_STATUS = {
  pending: { label: 'In execution', variant: 'sky' },
  'in-progress': { label: 'In progress', variant: 'sky' },
  approved: { label: 'Approved', variant: 'success' },
  completed: { label: 'Completed', variant: 'secondary' },
};

export const getCustomWorkStatus = status => {
  const key = typeof status === 'string' ? status.toLowerCase() : status;
  return CUSTOM_WORK_STATUS[key] ?? null;
};

/** Statuses a user can pick in the form. */
export const CUSTOM_WORK_STATUS_OPTIONS = [
  { label: CUSTOM_WORK_STATUS.pending.label, value: 'pending' },
  { label: CUSTOM_WORK_STATUS.completed.label, value: 'completed' },
];

/** The toolbar's quick switch. */
export const CUSTOM_WORK_STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  ...CUSTOM_WORK_STATUS_OPTIONS,
];

export const DEFAULT_CATEGORY_OPTIONS = [
  { label: 'Custom features', value: 'Custom Feature' },
  { label: 'Data integration', value: 'Data Integration' },
  { label: 'Enablement & support', value: 'Enablement & Support' },
  { label: 'Quality assurance', value: 'Quality Assurance' },
];

export const getCategoryLabel = value =>
  DEFAULT_CATEGORY_OPTIONS.find(option => option.value === value)?.label ?? value;

/** Adds a category option (case-insensitive de-duplication), as the old "Add category" did. */
export const addCategoryOption = (options, name) => {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return options;
  const exists = options.some(option => option.value.toLowerCase() === trimmed.toLowerCase());
  return exists ? options : [...options, { label: trimmed, value: trimmed }];
};
