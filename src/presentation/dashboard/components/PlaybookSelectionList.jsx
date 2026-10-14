import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiNetworkIcon, BookOpen01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import {
  CardIconTile,
  CardSelectCheck,
  SELECT_CARD_BACKDROP,
  selectCardClasses,
} from '@/components/card-parts';
import { DotBackdrop } from '@/components/dot-backdrop';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

const GRID_CLASSES = 'grid grid-cols-1 gap-3 @lg:grid-cols-2';

/** The agents a playbook runs, listed in a hover card behind an "N agents" chip. */
function PlaybookAgents({ agents }) {
  if (!agents.length) return null;
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          tabIndex={0}
          className="cursor-default"
          onClick={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
        >
          <HugeiconsIcon icon={AiNetworkIcon} strokeWidth={2} data-icon="inline-start" />
          {agents.length === 1 ? '1 agent' : `${agents.length} agents`}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="flex max-w-72 flex-col gap-2 p-3">
        <p className="text-xs font-medium text-muted-foreground">Agents in this playbook</p>
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto">
          {agents.map(agent => (
            <li key={agent.value} className="rounded-md bg-muted/60 px-2.5 py-2">
              <p className="text-[13px] font-medium text-foreground">{agent.label}</p>
              {agent.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {agent.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

/** Loading stand-in for the picker: the same grid of card shells. */
export function PlaybookSelectionSkeleton({ count = 4 }) {
  return (
    <div className="@container" aria-busy="true" aria-label="Loading playbooks">
      <div className={GRID_CLASSES}>
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="size-9 rounded-md" />
              <Skeleton className="size-5 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Playbooks as picker cards: the whole card toggles it (click, Enter or Space), the corner
 * check and a brand ring show what's picked. `onToggle(value, checked)`.
 */
const PlaybookSelectionList = ({
  playbooks = [],
  playbookAgentLabelMap = {},
  selectedPlaybooks = [],
  onToggle,
  emptyDescription = 'Only active playbooks can be assigned, and there are none right now.',
}) => {
  if (playbooks.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No active playbooks</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="@container">
      <div role="group" aria-label="Playbooks" className={GRID_CLASSES}>
        {playbooks.map(playbook => {
          const isChecked = selectedPlaybooks.includes(playbook.value);
          const agents = (playbook.agentTypes || []).map(agentType => ({
            value: agentType,
            label: playbookAgentLabelMap[agentType] || agentType,
            description: playbook.agentDescriptions?.[agentType] || '',
          }));
          const toggle = () => onToggle?.(playbook.value, !isChecked);

          return (
            <div
              key={playbook.value}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onClick={toggle}
              onKeyDown={event => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggle();
                }
              }}
              className={selectCardClasses({ selectable: true, selected: isChecked })}
            >
              <DotBackdrop active={isChecked} className={SELECT_CARD_BACKDROP} />
              <div className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <CardIconTile icon={playbook.icon} />
                  <CardSelectCheck selected={isChecked} />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                    {playbook.title}
                  </h3>
                  {playbook.shortDescription && (
                    <p className="line-clamp-2 text-[13px] text-muted-foreground">
                      {playbook.shortDescription}
                    </p>
                  )}
                </div>
                {agents.length > 0 && (
                  <div className="mt-auto pt-1">
                    <PlaybookAgents agents={agents} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaybookSelectionList;
