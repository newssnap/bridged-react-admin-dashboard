import { useState, useEffect } from 'react';
import { notification } from 'antd';
import {
  useLazyGetUserConfigurationQuery,
  useUpdateUserConfigurationMutation,
} from '../../../services/api';
import {
  AUTOMATE_PACK_OPTIONS,
  ENGAGE_PACK_OPTIONS,
  MONETIZE_PACK_OPTIONS,
  AGENT_TYPES,
} from '../../../constants/agents';

// Helper function to filter agents by type
const filterAgentsByType = (agents, type) => {
  return agents.filter(agent => agent.type === type).map(agent => agent.value);
};

// Helper function to get all agent values by type from selected values
const getAgentValuesByType = (selectedValues, allAgents, type) => {
  const agentsOfType = allAgents.filter(agent => agent.type === type);
  return selectedValues.filter(value => agentsOfType.some(agent => agent.value === value));
};

export const useAgentManagementHandler = () => {
  // Existing user agent management states
  const [selectedUserForAgents, setSelectedUserForAgents] = useState(null);
  const [allowedCampaigns, setAllowedCampaigns] = useState([]);
  const [allowedMonetizePack, setAllowedMonetizePack] = useState([]);
  const [allowedAIAgents, setAllowedAIAgents] = useState([]);

  // New user agent configuration states
  const [newUserAllowedCampaigns, setNewUserAllowedCampaigns] = useState([]);
  const [newUserAllowedMonetizePack, setNewUserAllowedMonetizePack] = useState([]);
  const [newUserAllowedAIAgents, setNewUserAllowedAIAgents] = useState([]);

  // API hooks
  const [fetchUserConfig, { isFetching: isFetchingUserConfig }] =
    useLazyGetUserConfigurationQuery();
  const [updateUserConfiguration, { isLoading: isSavingUserConfig }] =
    useUpdateUserConfigurationMutation();

  // Sync form fields when allowed lists change (pre-check on load)
  useEffect(() => {
    if (selectedUserForAgents) {
      // This will be handled by the parent component's form
    }
  }, [allowedCampaigns, allowedAIAgents, selectedUserForAgents]);

  // Existing user agent management handlers
  const handleSelectAllCampaigns = () => {
    const campaigns = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN);
    const smartReply = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.SMART_REPLY_AGENT);
    setAllowedCampaigns([...campaigns, ...smartReply]);
  };

  const handleClearCampaigns = () => {
    setAllowedCampaigns([]);
  };

  const handleSelectAllAIAgents = () => {
    setAllowedAIAgents(filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT));
  };

  const handleClearAIAgents = () => {
    setAllowedAIAgents([]);
  };

  const handleSelectAllMonetizePack = () => {
    setAllowedMonetizePack(filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN));
  };

  const handleClearMonetizePack = () => {
    setAllowedMonetizePack([]);
  };

  // New user agent management handlers
  const handleSelectAllNewUserCampaigns = () => {
    const campaigns = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN);
    const smartReply = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.SMART_REPLY_AGENT);
    setNewUserAllowedCampaigns([...campaigns, ...smartReply]);
  };

  const handleClearNewUserCampaigns = () => {
    setNewUserAllowedCampaigns([]);
  };

  const handleSelectAllNewUserAIAgents = () => {
    setNewUserAllowedAIAgents(filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT));
  };

  const handleClearNewUserAIAgents = () => {
    setNewUserAllowedAIAgents([]);
  };

  const handleSelectAllNewUserMonetizePack = () => {
    setNewUserAllowedMonetizePack(filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN));
  };

  const handleClearNewUserMonetizePack = () => {
    setNewUserAllowedMonetizePack([]);
  };

  // Open agents drawer for existing user
  const handleOpenAgentsDrawer = async record => {
    try {
      setSelectedUserForAgents(record);

      // Reset states first
      setAllowedCampaigns([]);
      setAllowedMonetizePack([]);
      setAllowedAIAgents([]);

      const response = await fetchUserConfig(record._id).unwrap();
      const payload = response?.data ?? response;
      const lockedCampaigns = Array.isArray(payload?.lockedCampaigns)
        ? payload.lockedCampaigns
        : [];
      const lockedAIAgents = Array.isArray(payload?.lockedAIAgents) ? payload.lockedAIAgents : [];
      const lockedSmartReplyAgents = Array.isArray(payload?.lockedSmartReplyAgents)
        ? payload.lockedSmartReplyAgents
        : [];

      // Convert locked to allowed (opposite logic)
      // If agent is locked, it should NOT be in allowed list
      const allowedCampaignsList = filterAgentsByType(
        ENGAGE_PACK_OPTIONS,
        AGENT_TYPES.CAMPAIGN
      ).filter(value => !lockedCampaigns.includes(value));
      const allowedMonetizePackList = filterAgentsByType(
        MONETIZE_PACK_OPTIONS,
        AGENT_TYPES.CAMPAIGN
      ).filter(value => !lockedCampaigns.includes(value));
      const allowedAIAgentsList = filterAgentsByType(
        AUTOMATE_PACK_OPTIONS,
        AGENT_TYPES.AI_AGENT
      ).filter(value => !lockedAIAgents.includes(value));

      // Handle SmartReplyAgents - they are in ENGAGE_PACK_OPTIONS but should be filtered by lockedSmartReplyAgents
      const allowedSmartReplyList = filterAgentsByType(
        ENGAGE_PACK_OPTIONS,
        AGENT_TYPES.SMART_REPLY_AGENT
      ).filter(value => !lockedSmartReplyAgents.includes(value));

      // Combine campaigns and smart reply agents for the campaigns state since they're in the same UI section
      setAllowedCampaigns([...allowedCampaignsList, ...allowedSmartReplyList]);
      setAllowedMonetizePack(allowedMonetizePackList);
      setAllowedAIAgents(allowedAIAgentsList);
    } catch (error) {
      console.error('Error fetching user config:', error);
      // If there's an error, set all agents as allowed (default state)
      const allCampaigns = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN);
      const allSmartReply = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.SMART_REPLY_AGENT);
      setAllowedCampaigns([...allCampaigns, ...allSmartReply]);
      setAllowedMonetizePack(filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN));
      setAllowedAIAgents(filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT));
      notification.error({
        message: 'Error',
        description: 'Failed to fetch user configuration.',
      });
    }
  };

  const handleCloseAgentsDrawer = () => {
    setSelectedUserForAgents(null);
    setAllowedCampaigns([]);
    setAllowedMonetizePack([]);
    setAllowedAIAgents([]);
  };

  const handleSaveAgentsConfig = async () => {
    if (!selectedUserForAgents?._id) return;
    try {
      // Convert allowed to locked (opposite logic)
      // Get all possible values for each type
      const allCampaignValues = [
        ...filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN),
        ...filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN),
      ];
      const allAIAgentValues = filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT);
      const allSmartReplyValues = filterAgentsByType(
        ENGAGE_PACK_OPTIONS,
        AGENT_TYPES.SMART_REPLY_AGENT
      );

      const allAllowedCampaignValues = [...allowedCampaigns, ...allowedMonetizePack];
      const allAllowedAIAgentValues = allowedAIAgents;

      const allowedCampaignsOnly = getAgentValuesByType(
        allowedCampaigns,
        ENGAGE_PACK_OPTIONS,
        AGENT_TYPES.CAMPAIGN
      );
      const allAllowedSmartReplyValues = getAgentValuesByType(
        allowedCampaigns,
        ENGAGE_PACK_OPTIONS,
        AGENT_TYPES.SMART_REPLY_AGENT
      );

      const lockedCampaigns = allCampaignValues.filter(
        value => !allowedCampaignsOnly.includes(value)
      );
      const lockedAIAgents = allAIAgentValues.filter(
        value => !allAllowedAIAgentValues.includes(value)
      );
      const lockedSmartReplyAgents = allSmartReplyValues.filter(
        value => !allAllowedSmartReplyValues.includes(value)
      );

      await updateUserConfiguration({
        userId: selectedUserForAgents._id,
        lockedCampaigns,
        lockedAIAgents,
        lockedSmartReplyAgents,
      }).unwrap();
      notification.success({
        message: 'Saved',
        description: 'User agents configuration updated successfully.',
      });
      handleCloseAgentsDrawer();
    } catch (error) {
      notification.error({
        message: 'Save Failed',
        description: 'Could not update user agents configuration.',
      });
    }
  };

  const resetNewUserAgentStates = () => {
    setNewUserAllowedCampaigns([]);
    setNewUserAllowedMonetizePack([]);
    setNewUserAllowedAIAgents([]);
  };

  const generateNewUserConfigurations = () => {
    // Convert allowed to locked (opposite logic) for new user
    // Get all possible values for each type
    const allCampaignValues = [
      ...filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN),
      ...filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN),
    ];
    const allAIAgentValues = filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT);
    const allSmartReplyValues = filterAgentsByType(
      ENGAGE_PACK_OPTIONS,
      AGENT_TYPES.SMART_REPLY_AGENT
    );

    const allAllowedAIAgentValues = newUserAllowedAIAgents;

    const allowedCampaignsOnly = getAgentValuesByType(
      newUserAllowedCampaigns,
      ENGAGE_PACK_OPTIONS,
      AGENT_TYPES.CAMPAIGN
    );
    const allAllowedSmartReplyValues = getAgentValuesByType(
      newUserAllowedCampaigns,
      ENGAGE_PACK_OPTIONS,
      AGENT_TYPES.SMART_REPLY_AGENT
    );
    const allowedMonetizePackValues = newUserAllowedMonetizePack;

    const lockedCampaigns = allCampaignValues.filter(
      value => !allowedCampaignsOnly.includes(value)
    );
    const lockedAIAgents = allAIAgentValues.filter(
      value => !allAllowedAIAgentValues.includes(value)
    );
    const lockedSmartReplyAgents = allSmartReplyValues.filter(
      value => !allAllowedSmartReplyValues.includes(value)
    );

    return {
      lockedCampaigns,
      lockedAIAgents,
      lockedSmartReplyAgents,
    };
  };

  return {
    // Existing user states
    selectedUserForAgents,
    allowedCampaigns,
    allowedMonetizePack,
    allowedAIAgents,
    setAllowedCampaigns,
    setAllowedMonetizePack,
    setAllowedAIAgents,

    // New user states
    newUserAllowedCampaigns,
    newUserAllowedMonetizePack,
    newUserAllowedAIAgents,
    setNewUserAllowedCampaigns,
    setNewUserAllowedMonetizePack,
    setNewUserAllowedAIAgents,

    // Loading states
    isFetchingUserConfig,
    isSavingUserConfig,

    // Existing user handlers
    handleSelectAllCampaigns,
    handleClearCampaigns,
    handleSelectAllMonetizePack,
    handleClearMonetizePack,
    handleSelectAllAIAgents,
    handleClearAIAgents,
    handleOpenAgentsDrawer,
    handleCloseAgentsDrawer,
    handleSaveAgentsConfig,

    // New user handlers
    handleSelectAllNewUserCampaigns,
    handleClearNewUserCampaigns,
    handleSelectAllNewUserMonetizePack,
    handleClearNewUserMonetizePack,
    handleSelectAllNewUserAIAgents,
    handleClearNewUserAIAgents,
    resetNewUserAgentStates,
    generateNewUserConfigurations,
  };
};
