/**
 * Page numbers to render for `current` of `totalPages` (1-based), with 'ellipsis-start' /
 * 'ellipsis-end' markers. Shows `siblings` pages on each side of the current one
 * (1 for a compact pager, 2 by default), always the first and last page.
 */
export function getPaginationItems(current, totalPages, { siblings = 2 } = {}) {
  if (totalPages <= 3 + siblings * 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  let left = Math.max(1, current - siblings);
  let right = Math.min(current + siblings, totalPages);
  if (current - 1 <= siblings) right = 1 + siblings * 2;
  if (totalPages - current <= siblings) left = totalPages - siblings * 2;
  const items = [];
  for (let page = left; page <= right; page += 1) items.push(page);
  if (current - 1 >= siblings * 2 && current !== 3) items.unshift('ellipsis-start');
  if (totalPages - current >= siblings * 2 && current !== totalPages - 2) {
    items.push('ellipsis-end');
  }
  if (left !== 1) items.unshift(1);
  if (right !== totalPages) items.push(totalPages);
  return items;
}
