import { useGetUserChecklistQuery, useGetTeamMembersQuery } from '../../../services/api';

export const useUserChecklistHandler = () => {
  const { data: userChecklist, isLoading: isLoadingUserChecklist } = useGetUserChecklistQuery(id);
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useGetTeamMembersQuery(id);
  return { userChecklist, teamMembers, isLoadingUserChecklist, isLoadingTeamMembers };
};
