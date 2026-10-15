import { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  useGetCustomWorkQuery,
  useGetTeamCreditsQuery,
  useGetTeamsQuery,
  useGetUserAdminPaginationMutation,
} from '../../../services/api';

// Users come back newest login first, so one page this size covers everyone active lately.
const ACTIVITY_SAMPLE = 100;
const ACTIVE_WINDOW_DAYS = 30;
const RECENT_TEAMS = 6;

const listOf = response =>
  response?.data?.data ?? response?.data ?? (Array.isArray(response) ? response : []);

/**
 * Everything the admin Home shows, derived from the existing list endpoints: teams, users
 * (sorted by last login), team credits and custom work. No new API calls.
 */
const useHomeHandler = () => {
  const teamsQuery = useGetTeamsQuery();
  const creditsQuery = useGetTeamCreditsQuery();
  const customWorkQuery = useGetCustomWorkQuery();
  const [_FETCH_USERS, usersState] = useGetUserAdminPaginationMutation();

  const fetchUsers = useCallback(
    () =>
      _FETCH_USERS({
        sort: 'lastLogin_DESC',
        search: '',
        pageNumber: 1,
        limit: ACTIVITY_SAMPLE,
      }),
    [_FETCH_USERS]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const teams = useMemo(() => teamsQuery.data?.data ?? [], [teamsQuery.data]);
  const users = useMemo(() => listOf(usersState.data), [usersState.data]);
  const response = usersState.data;
  const usersTotal =
    response?.total ??
    response?.totalLength ??
    response?.data?.total ??
    response?.data?.totalLength ??
    (users.length || null);

  const stats = useMemo(() => {
    const monthStart = dayjs().startOf('month');
    const activeSince = dayjs().subtract(ACTIVE_WINDOW_DAYS, 'day');
    const datedTeams = teams.filter(team => team?.createdAt);
    const activeUsers = users.filter(
      user => user?.last_login_at && dayjs(user.last_login_at).isAfter(activeSince)
    ).length;
    const companies = new Set(teams.map(team => team?.companyName).filter(Boolean));

    return {
      teams: teams.length,
      newTeamsThisMonth: datedTeams.length
        ? datedTeams.filter(team => dayjs(team.createdAt).isAfter(monthStart)).length
        : null,
      companies: companies.size,
      people: usersTotal,
      // A full sample means there may be more active people than we fetched.
      activePeople: activeUsers,
      activePeopleCapped: activeUsers >= ACTIVITY_SAMPLE,
      brandedTeams: teams.filter(team => team?.isWhitelabelingEnabled).length,
    };
  }, [teams, users, usersTotal]);

  // Teams ranked by their most recent member login.
  const recentTeams = useMemo(() => {
    const byName = new Map(teams.map(team => [team?.title, team]));
    const seen = new Map();
    users.forEach(user => {
      const name = user?.teamTitle;
      if (!name || !user?.last_login_at || seen.has(name)) return;
      const team = byName.get(name);
      seen.set(name, {
        key: team?._id || name,
        name,
        companyName: team?.companyName || user?.company?.name || null,
        memberCount: team?.memberCount ?? null,
        ownerEmail: team?.ownerEmail || null,
        lastActiveAt: user.last_login_at,
        lastActiveBy: user?.fullname?.trim() || user?.email || null,
      });
    });
    return [...seen.values()].slice(0, RECENT_TEAMS);
  }, [teams, users]);

  const attention = useMemo(() => {
    const credits = creditsQuery.data?.data ?? [];
    const customWork = Array.isArray(customWorkQuery.data) ? customWorkQuery.data : [];
    return {
      outOfCredits: credits.filter(item => (item?.creditBalance ?? 0) <= 0).length,
      inExecution: customWork.filter(
        item => (item?.usageData?.customWorkStatus || 'pending') === 'pending'
      ).length,
      withoutCompany: teams.filter(team => !team?.companyName && !team?.companyId).length,
    };
  }, [creditsQuery.data, customWorkQuery.data, teams]);

  return {
    stats,
    recentTeams,
    attention,
    isTeamsLoading: teamsQuery.isLoading,
    isUsersLoading: usersState.isUninitialized || usersState.isLoading,
    isAttentionLoading: teamsQuery.isLoading || creditsQuery.isLoading || customWorkQuery.isLoading,
    isTeamsError: teamsQuery.isError,
    isUsersError: usersState.isError,
    isAttentionError: teamsQuery.isError || creditsQuery.isError || customWorkQuery.isError,
    refetchTeams: teamsQuery.refetch,
    refetchUsers: fetchUsers,
    refetchAttention: () => {
      teamsQuery.refetch();
      creditsQuery.refetch();
      customWorkQuery.refetch();
    },
  };
};

export default useHomeHandler;
