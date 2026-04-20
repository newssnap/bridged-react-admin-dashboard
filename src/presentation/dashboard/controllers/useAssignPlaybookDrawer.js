import { useCallback, useMemo, useState } from 'react';
import { AGENT_ACCESS_OPTIONS } from '../../../constants/agents';
import { PlaybookType, agentTypesForPlaybooks } from '../../../constants/playbooks';
import { useGetPlaybooksQuery } from '../../../services/api';

const useAssignPlaybookDrawer = ({ form }) => {
  const [isPlaybookDrawerOpen, setIsPlaybookDrawerOpen] = useState(false);
  const [selectedPlaybooks, setSelectedPlaybooks] = useState([]);
  const [draftSelectedPlaybooks, setDraftSelectedPlaybooks] = useState([]);
  const [initialAssignedPlaybookTypes, setInitialAssignedPlaybookTypes] = useState([]);
  const [teamAssignedPlaybookIdsByType, setTeamAssignedPlaybookIdsByType] = useState({});

  const { data: playbooksResponse, isLoading: isLoadingPlaybooks } = useGetPlaybooksQuery();

  const playbookMetaMap = useMemo(() => {
    const map = {};
    Object.values(PlaybookType ?? {}).forEach(playbook => {
      map[playbook.value] = playbook;
    });
    return map;
  }, []);

  const playbooks = useMemo(() => {
    const serverPlaybooks = playbooksResponse?.data ?? [];

    return serverPlaybooks
      .map(serverPlaybook => {
        const playbookType = serverPlaybook?.playbookType;
        if (!playbookType || !playbookMetaMap[playbookType]) {
          return null;
        }

        const localMeta = playbookMetaMap[playbookType];
        return {
          id: serverPlaybook.id,
          value: playbookType,
          title: serverPlaybook.title || localMeta.title,
          icon: localMeta.icon,
          shortDescription: localMeta.shortDescription,
          longDescription: localMeta.longDescription,
          agentTypes: serverPlaybook.agentTypes || [],
          agentDescriptions: localMeta.agentDescriptions || {},
          isDefault: serverPlaybook.isDefault,
        };
      })
      .filter(Boolean);
  }, [playbooksResponse, playbookMetaMap]);

  const playbookAgentLabelMap = useMemo(() => {
    const labels = {};
    agentTypesForPlaybooks?.forEach(agent => {
      labels[agent.value] = agent.label;
    });

    AGENT_ACCESS_OPTIONS?.forEach(agent => {
      if (!labels[agent.value]) {
        labels[agent.value] = agent.label;
      }
    });

    return labels;
  }, []);

  const handleTeamPlaybooksLoaded = useCallback(
    teamItems => {
      const items = teamItems ?? [];
      const withMeta = items.filter(
        item => item?.playbookType && playbookMetaMap[item.playbookType]
      );
      const types = withMeta.map(item => item.playbookType);
      const idsByType = {};
      withMeta.forEach(item => {
        if (item.playbookType && item.id) {
          idsByType[item.playbookType] = item.id;
        }
      });
      setInitialAssignedPlaybookTypes(types);
      setTeamAssignedPlaybookIdsByType(idsByType);
      setSelectedPlaybooks(types);
      setDraftSelectedPlaybooks(types);
    },
    [playbookMetaMap]
  );

  const openPlaybooksDrawer = () => {
    setInitialAssignedPlaybookTypes([]);
    setTeamAssignedPlaybookIdsByType({});
    setDraftSelectedPlaybooks([]);
    setSelectedPlaybooks([]);
    setIsPlaybookDrawerOpen(true);
  };

  const closePlaybooksDrawer = () => {
    setIsPlaybookDrawerOpen(false);
  };

  const applyPlaybooksSelection = () => {
    setSelectedPlaybooks(draftSelectedPlaybooks);
    form.setFieldValue('assignedPlaybooks', draftSelectedPlaybooks);
    setIsPlaybookDrawerOpen(false);
  };

  const handlePlaybookToggle = (playbookValue, checked) => {
    setDraftSelectedPlaybooks(prev =>
      checked
        ? [...new Set([...prev, playbookValue])]
        : prev.filter(value => value !== playbookValue)
    );
  };

  const resetPlaybooksState = () => {
    setSelectedPlaybooks([]);
    setDraftSelectedPlaybooks([]);
    setInitialAssignedPlaybookTypes([]);
    setTeamAssignedPlaybookIdsByType({});
    setIsPlaybookDrawerOpen(false);
  };

  return {
    playbooks,
    playbookAgentLabelMap,
    isLoadingPlaybooks,
    selectedPlaybooks,
    draftSelectedPlaybooks,
    initialAssignedPlaybookTypes,
    teamAssignedPlaybookIdsByType,
    isPlaybookDrawerOpen,
    openPlaybooksDrawer,
    closePlaybooksDrawer,
    applyPlaybooksSelection,
    handlePlaybookToggle,
    resetPlaybooksState,
    handleTeamPlaybooksLoaded,
  };
};

export default useAssignPlaybookDrawer;
