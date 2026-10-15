import dayjs from 'dayjs';

export default function formatDate(date) {
  // Check if the input date is falsy (null, undefined, empty string, etc.)
  if (!date) {
    return '—'; // Return a placeholder for empty dates
  }

  // e.g. "9 Oct 2026": unambiguous in every locale, and the format used across the dashboard.
  return dayjs(date).format('D MMM YYYY');
}

export function formatDateAndTime(date) {
  if (!date) {
    return '—';
  }

  return dayjs(date).format('D MMM YYYY, HH:mm');
}
