import { useState, useEffect } from 'react';
import { notification } from 'antd';
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
  // Existing user agent management states (edit user drawer)
  const [allowedCampaigns, setAllowedCampaigns] = useState([]);
  const [allowedMonetizePack, setAllowedMonetizePack] = useState([]);
  const [allowedAIAgents, setAllowedAIAgents] = useState([]);

  // New user agent configuration states
  const [newUserAllowedCampaigns, setNewUserAllowedCampaigns] = useState([]);
  const [newUserAllowedMonetizePack, setNewUserAllowedMonetizePack] = useState([]);
  const [newUserAllowedAIAgents, setNewUserAllowedAIAgents] = useState([]);

  // NOTE: We no longer use the separate UserConfiguration API / drawer.
  // Existing user configurations are loaded from `getUserForUpdateByAdmin` response
  // and saved via `updateUserByAdmin` in the Edit User drawer.

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

  const resetExistingUserAgentStates = () => {
    setAllowedCampaigns([]);
    setAllowedMonetizePack([]);
    setAllowedAIAgents([]);
  };

  const resetNewUserAgentStates = () => {
    setNewUserAllowedCampaigns([]);
    setNewUserAllowedMonetizePack([]);
    setNewUserAllowedAIAgents([]);
  };

  const initializeExistingUserAgentStates = userConfigurations => {
    try {
      const lockedCampaigns = Array.isArray(userConfigurations?.lockedCampaigns)
        ? userConfigurations.lockedCampaigns
        : [];
      const lockedAIAgents = Array.isArray(userConfigurations?.lockedAIAgents)
        ? userConfigurations.lockedAIAgents
        : [];
      const lockedSmartReplyAgents = Array.isArray(userConfigurations?.lockedSmartReplyAgents)
        ? userConfigurations.lockedSmartReplyAgents
        : [];

      // Convert locked to allowed (opposite logic)
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

      const allowedSmartReplyList = filterAgentsByType(
        ENGAGE_PACK_OPTIONS,
        AGENT_TYPES.SMART_REPLY_AGENT
      ).filter(value => !lockedSmartReplyAgents.includes(value));

      setAllowedCampaigns([...allowedCampaignsList, ...allowedSmartReplyList]);
      setAllowedMonetizePack(allowedMonetizePackList);
      setAllowedAIAgents(allowedAIAgentsList);
    } catch (error) {
      // Default: allow everything if parsing fails
      const allCampaigns = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN);
      const allSmartReply = filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.SMART_REPLY_AGENT);
      setAllowedCampaigns([...allCampaigns, ...allSmartReply]);
      setAllowedMonetizePack(filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN));
      setAllowedAIAgents(filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT));
      notification.error({
        message: 'Error',
        description: 'Failed to load user agent configuration. Defaulted to full access.',
      });
    }
  };

  const generateExistingUserConfigurations = () => {
    // Convert allowed to locked (opposite logic) for existing user
    const allCampaignValues = [
      ...filterAgentsByType(ENGAGE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN),
      ...filterAgentsByType(MONETIZE_PACK_OPTIONS, AGENT_TYPES.CAMPAIGN),
    ];
    const allAIAgentValues = filterAgentsByType(AUTOMATE_PACK_OPTIONS, AGENT_TYPES.AI_AGENT);
    const allSmartReplyValues = filterAgentsByType(
      ENGAGE_PACK_OPTIONS,
      AGENT_TYPES.SMART_REPLY_AGENT
    );

    const allowedCampaignsOnly = getAgentValuesByType(
      allowedCampaigns,
      ENGAGE_PACK_OPTIONS,
      AGENT_TYPES.CAMPAIGN
    );
    const allowedSmartReplyValues = getAgentValuesByType(
      allowedCampaigns,
      ENGAGE_PACK_OPTIONS,
      AGENT_TYPES.SMART_REPLY_AGENT
    );

    const lockedCampaigns = allCampaignValues.filter(
      value => !allowedCampaignsOnly.includes(value)
    );
    const lockedAIAgents = allAIAgentValues.filter(value => !allowedAIAgents.includes(value));
    const lockedSmartReplyAgents = allSmartReplyValues.filter(
      value => !allowedSmartReplyValues.includes(value)
    );

    return {
      lockedCampaigns,
      lockedAIAgents,
      lockedSmartReplyAgents,
    };
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
    // Existing user states (edit user drawer)
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

    // Existing user handlers (edit user drawer)
    handleSelectAllCampaigns,
    handleClearCampaigns,
    handleSelectAllMonetizePack,
    handleClearMonetizePack,
    handleSelectAllAIAgents,
    handleClearAIAgents,
    resetExistingUserAgentStates,
    initializeExistingUserAgentStates,
    generateExistingUserConfigurations,

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
