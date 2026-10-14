import dayjs from 'dayjs';

export const NUMBER_LOCALE = 'en-GB';

const numberFormat = new Intl.NumberFormat(NUMBER_LOCALE, { maximumFractionDigits: 2 });

/** "1,250" for numbers, "—" for anything else. */
export const formatNumber = value =>
  typeof value === 'number' && Number.isFinite(value) ? numberFormat.format(value) : '—';

/** The controllers mark missing values with '—' ('--' before); treat those and empties as missing. */
export const hasValue = value =>
  !(value === undefined || value === null || value === '' || value === '--' || value === '—');

export const orDash = value => (hasValue(value) ? value : '—');

/** "1 team", "3 teams". */
export const plural = (count, word, pluralWord = `${word}s`) =>
  `${formatNumber(count)} ${count === 1 ? word : pluralWord}`;

/** "3 – 13 Oct 2026", "28 Sept – 3 Oct 2026", "20 Dec 2025 – 4 Jan 2026"; "—" when missing. */
export function formatDateRange(start, end) {
  const from = start ? dayjs(start) : null;
  const to = end ? dayjs(end) : null;
  const valid = date => Boolean(date?.isValid());
  if (!valid(from) && !valid(to)) return '—';
  if (!valid(from)) return `Until ${to.format('D MMM YYYY')}`;
  if (!valid(to)) return `From ${from.format('D MMM YYYY')}`;
  if (from.isSame(to, 'day')) return from.format('D MMM YYYY');
  if (from.isSame(to, 'month')) return `${from.format('D')} – ${to.format('D MMM YYYY')}`;
  if (from.isSame(to, 'year')) return `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`;
  return `${from.format('D MMM YYYY')} – ${to.format('D MMM YYYY')}`;
}

/** Usage bands (design system §8): under 75% fine, 75–90% high, 90%+ nearly out. */
export function usageStatus(percent) {
  if (percent >= 90) {
    return {
      label: 'Credits nearly exhausted',
      badge: 'destructive',
      bar: '*:data-[slot=progress-indicator]:bg-destructive',
    };
  }
  if (percent >= 75) {
    return {
      label: 'High usage',
      badge: 'warning',
      bar: '*:data-[slot=progress-indicator]:bg-warning',
    };
  }
  return { label: 'Usage within limits', badge: 'success', bar: '' };
}

/**
 * Ledger totals for a team: what was assigned, what was deducted, and how much of the net
 * amount has been used given the current balance.
 */
export function ledgerUsage(history, balance) {
  const entries = Array.isArray(history) ? history : [];
  let assigned = 0;
  let deducted = 0;
  entries.forEach(entry => {
    const amount = Number(entry?.amount) || 0;
    if (entry?.purchaseType === 'deduct') deducted += amount;
    else assigned += amount;
  });
  const net = assigned - deducted;
  const current = Number(balance) || 0;
  const used = net > 0 ? Math.min(net, Math.max(0, net - current)) : 0;
  const percent = net > 0 ? Math.round((used / net) * 1000) / 10 : 0;
  return { assigned, deducted, net, used, percent };
}
