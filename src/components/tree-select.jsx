import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Cancel01Icon, UnfoldMoreIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * Checkable tree select (multiple): Popover + Command list of tree rows with Checkboxes.
 *
 * - `items`: `{ title, value, children?, disabled? }[]` (nested).
 * - `value`: array of checked values; `onValueChange(values, labels)`.
 * - Checking a node checks all its descendants; a parent counts as checked when all its
 *   children are; unchecking removes the node, its descendants and its ancestors.
 * - `checkedStrategy` decides which checked values are emitted:
 *   'child' (default, leaves only), 'parent' (a fully checked parent replaces its
 *   children), 'all'. Values that are not in the tree are kept (first).
 * - `filter(query, node)` customises search (default: title contains query).
 * - `renderChip({ label, value, closable, onClose })` customises the selected chips.
 * - `placeholder`, `emptyText`, `disabled`, `className` (trigger), `contentClassName`.
 */

function buildEntities(items) {
  const map = new Map();
  const order = [];
  const walk = (nodes, parent, level) =>
    (nodes || []).map(node => {
      const entity = {
        node,
        value: node.value !== undefined ? node.value : node.key,
        title: node.title !== undefined ? node.title : node.label,
        parent,
        level,
        disabled: !!node.disabled,
        children: [],
      };
      map.set(entity.value, entity);
      order.push(entity);
      entity.children = walk(node.children, entity, level + 1);
      return entity;
    });
  const roots = walk(items, null, 0);
  return { map, order, roots };
}

const descendantsOf = entity => {
  const list = [];
  const dig = e =>
    e.children.forEach(child => {
      list.push(child);
      dig(child);
    });
  dig(entity);
  return list;
};

/** Checked / half-checked sets implied by some checked values. */
function conduct(values, entities) {
  const checked = new Set();
  values.forEach(value => {
    const entity = entities.map.get(value);
    if (!entity) return;
    checked.add(value);
    descendantsOf(entity).forEach(d => {
      if (!d.disabled) checked.add(d.value);
    });
  });
  const halfChecked = new Set();
  [...entities.order]
    .sort((a, b) => b.level - a.level)
    .forEach(entity => {
      const kids = entity.children.filter(child => !child.disabled);
      if (!kids.length || entity.disabled) return;
      if (kids.every(child => checked.has(child.value))) checked.add(entity.value);
      else if (kids.some(child => checked.has(child.value) || halfChecked.has(child.value)))
        halfChecked.add(entity.value);
    });
  return { checked, halfChecked };
}

function uncheck(entity, checked) {
  const next = new Set(checked);
  next.delete(entity.value);
  descendantsOf(entity).forEach(d => next.delete(d.value));
  for (let parent = entity.parent; parent; parent = parent.parent) next.delete(parent.value);
  return next;
}

function applyStrategy(values, strategy, entities) {
  const set = new Set(values);
  if (strategy === 'child') {
    return values.filter(value => {
      const entity = entities.map.get(value);
      return !entity || !entity.children.length || entity.children.every(c => c.disabled);
    });
  }
  if (strategy === 'parent') {
    return values.filter(value => {
      const parent = entities.map.get(value)?.parent;
      return !parent || parent.disabled || !set.has(parent.value);
    });
  }
  return values;
}

/** Previous order first, then newly checked values in tree order. */
function orderChecked(checked, previous, entities) {
  const result = [];
  const seen = new Set();
  const push = value => {
    if (checked.has(value) && !seen.has(value)) {
      result.push(value);
      seen.add(value);
    }
  };
  previous.forEach(push);
  entities.order.forEach(entity => push(entity.value));
  return result;
}

const defaultFilter = (query, node) =>
  String(node?.title ?? '')
    .toLowerCase()
    .includes(query.toLowerCase());

function DefaultChip({ label, closable, onClose }) {
  return (
    <span
      data-slot="tree-select-chip"
      className="flex h-5.5 max-w-full items-center gap-1 rounded-sm bg-input px-2 text-xs font-medium whitespace-nowrap text-foreground dark:bg-input/60"
    >
      <span className="truncate">{label}</span>
      {closable && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onClose}
          className="-me-1 flex size-4 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
        </button>
      )}
    </span>
  );
}

function TreeSelect({
  items,
  value,
  onValueChange,
  checkedStrategy = 'child',
  placeholder,
  emptyText = 'No results found.',
  filter = defaultFilter,
  renderChip,
  disabled = false,
  className,
  contentClassName,
  id,
  'aria-invalid': ariaInvalid,
}) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState(() => new Set());
  const entities = React.useMemo(() => buildEntities(items), [items]);

  const rawValues = React.useMemo(() => value ?? [], [value]);
  const missing = rawValues.filter(v => !entities.map.has(v));
  const existing = rawValues.filter(v => entities.map.has(v));
  const { checked, halfChecked } = conduct(existing, entities);
  const displayValues = [
    ...missing,
    ...applyStrategy(orderChecked(checked, existing, entities), checkedStrategy, entities),
  ];
  const labelOf = v => entities.map.get(v)?.title ?? v;

  const emit = nextValues => onValueChange?.(nextValues, nextValues.map(labelOf));

  const toggle = entity => {
    if (!entity || entity.disabled) return;
    const isChecked = checked.has(entity.value);
    const nextChecked = isChecked
      ? uncheck(entity, checked)
      : conduct([...checked, entity.value], entities).checked;
    const order = isChecked ? existing : [...existing, entity.value];
    emit([
      ...missing,
      ...applyStrategy(orderChecked(nextChecked, order, entities), checkedStrategy, entities),
    ]);
  };

  const removeValue = v => {
    const entity = entities.map.get(v);
    if (entity) toggle(entity);
    else emit(displayValues.filter(item => item !== v));
  };

  const matches = React.useMemo(() => {
    if (!query) return null;
    const set = new Set();
    entities.order.forEach(entity => {
      if (filter(query, entity.node)) {
        for (let e = entity; e; e = e.parent) set.add(e.value);
      }
    });
    return set;
  }, [query, entities, filter]);

  const rows = [];
  const dig = list =>
    list.forEach(entity => {
      if (matches && !matches.has(entity.value)) return;
      rows.push(entity);
      if (entity.children.length && (matches || expanded.has(entity.value))) dig(entity.children);
    });
  dig(entities.roots);

  const toggleExpand = entity =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(entity.value)) next.delete(entity.value);
      else next.add(entity.value);
      return next;
    });

  const Chip = renderChip ?? DefaultChip;

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={next => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <div
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-disabled={disabled || undefined}
          aria-invalid={ariaInvalid}
          tabIndex={disabled ? -1 : 0}
          data-slot="tree-select-trigger"
          className={cn(
            'flex min-h-9 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-sm border border-transparent bg-input/50 py-1.5 ps-3 pe-8 text-sm transition-[color,box-shadow,background-color,border-color] duration-150 ease-out-quad outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/30 relative has-data-[slot=tree-select-chip]:ps-1.5',
            className
          )}
        >
          {displayValues.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {displayValues.map(v => (
            <span
              key={String(v)}
              className="contents"
              onClick={event => event.stopPropagation()}
              onPointerDown={event => event.stopPropagation()}
            >
              {Chip({
                label: labelOf(v),
                value: v,
                closable: !disabled,
                onClose: event => {
                  event?.preventDefault?.();
                  removeValue(v);
                },
              })}
            </span>
          ))}
          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            strokeWidth={2}
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        align="start"
        className={cn('w-(--radix-popover-trigger-width) min-w-64 p-0', contentClassName)}
      >
        <Command shouldFilter={false} className="rounded-lg bg-transparent">
          <CommandInput placeholder="Search" value={query} onValueChange={setQuery} />
          <CommandList className="max-h-96 p-1">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {rows.map(entity => {
              const isChecked = checked.has(entity.value);
              const isHalf = !isChecked && halfChecked.has(entity.value);
              const hasChildren = entity.children.length > 0;
              const isOpen = Boolean(matches) || expanded.has(entity.value);
              return (
                <CommandItem
                  key={String(entity.value)}
                  value={`${String(entity.value)} ${String(entity.title ?? '')}`}
                  disabled={entity.disabled}
                  onSelect={() => toggle(entity)}
                  className="gap-2 py-1.5"
                  style={{ paddingInlineStart: `${0.5 + entity.level * 1.25}rem` }}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                      aria-expanded={isOpen}
                      onClick={event => {
                        event.stopPropagation();
                        if (!matches) toggleExpand(entity);
                      }}
                      onPointerDown={event => event.stopPropagation()}
                      className="pointer-events-auto flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/10"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2}
                        className={cn(
                          'size-3.5 transition-transform duration-150 ease-out-quad',
                          isOpen && 'rotate-90'
                        )}
                      />
                    </button>
                  ) : (
                    <span className="size-5 shrink-0" />
                  )}
                  <Checkbox
                    tabIndex={-1}
                    aria-hidden
                    checked={isChecked ? true : isHalf ? 'indeterminate' : false}
                    className="pointer-events-none"
                  />
                  <span className="truncate">{entity.title}</span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { TreeSelect };
