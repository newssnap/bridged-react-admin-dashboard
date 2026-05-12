import dayjs from 'dayjs';

/**
 * When the user chooses "In Execution" (pending) but the end date is already in the past,
 * persist as "completed" — past work cannot remain in execution.
 */
export function resolveCustomWorkStatusForSubmit(status, dateTo) {
  if (status !== 'pending') return status;

  const end = dayjs(dateTo);
  if (!dateTo || !end.isValid()) return status;

  const endOfEndDay = end.endOf('day');
  if (endOfEndDay.isBefore(dayjs())) {
    return 'completed';
  }

  return status;
}
