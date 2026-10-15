import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Building03Icon,
  PaintBoardIcon,
  UserCheck01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { PageHeader, StatCell, StatStrip } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import useHomeHandler from '../controllers/useHomeHandler';
import RecentTeamsPanel from '../components/RecentTeamsPanel';
import AttentionPanel from '../components/AttentionPanel';

const statIcon = icon => <HugeiconsIcon icon={icon} strokeWidth={2} />;
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

function HomeWorkflow() {
  const navigate = useNavigate();
  const firstName = (localStorage.getItem('fullname') || '').trim().split(/\s+/)[0];
  const {
    stats,
    recentTeams,
    attention,
    isTeamsLoading,
    isUsersLoading,
    isAttentionLoading,
    isUsersError,
    isAttentionError,
    refetchUsers,
    refetchAttention,
  } = useHomeHandler();

  const teamsHint =
    stats.newTeamsThisMonth != null
      ? `${stats.newTeamsThisMonth} new this month`
      : `Across ${plural(stats.companies, 'company', 'companies')}`;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}.` : `${greeting()}.`}
        description="Here's where your teams and accounts stand."
        actions={
          <Button onClick={() => navigate('/teams', { state: { createTeam: true } })}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Create team
          </Button>
        }
      />

      <StatStrip>
        <StatCell
          label="Teams"
          icon={statIcon(Building03Icon)}
          value={stats.teams}
          hint={teamsHint}
          loading={isTeamsLoading}
        />
        <StatCell
          label="People"
          icon={statIcon(UserMultipleIcon)}
          value={stats.people ?? '—'}
          hint="With a login"
          loading={isUsersLoading}
        />
        <StatCell
          label="People active"
          icon={statIcon(UserCheck01Icon)}
          value={
            isUsersError
              ? '—'
              : `${stats.activePeople}${stats.activePeopleCapped ? '+' : ''} of ${stats.people ?? '—'}`
          }
          hint="Logged in within 30 days"
          loading={isUsersLoading}
        />
        <StatCell
          label="Branded teams"
          icon={statIcon(PaintBoardIcon)}
          value={`${stats.brandedTeams} of ${stats.teams}`}
          hint="White label switched on"
          loading={isTeamsLoading}
        />
      </StatStrip>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <RecentTeamsPanel
            teams={recentTeams}
            loading={isUsersLoading || isTeamsLoading}
            error={isUsersError}
            onRetry={refetchUsers}
          />
        </div>
        <div>
          <AttentionPanel
            attention={attention}
            loading={isAttentionLoading}
            error={isAttentionError}
            onRetry={refetchAttention}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeWorkflow;
