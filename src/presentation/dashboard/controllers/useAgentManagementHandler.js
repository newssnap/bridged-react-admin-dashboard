import { useState, useEffect } from 'react';
import { notification } from 'antd';
import {
  AUTOMATE_PACK_OPTIONS,
  ENGAGE_PACK_OPTIONS,
  MONETIZE_PACK_OPTIONS,
  AGENT_TYPES,
  AGENT_ACCESS_OPTIONS,
} from '../../../constants/agents';

const DEA_VALUE = 'DEA';
const CAMPAIGN_ACCESS_VALUES = ['rag', 'pollingAgent', 'affiliateLink'];
const QUALIFICATION_VALUE = 'qualification';

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
  // Existing user agent management states (edit user drawer) – simplified same as Add User
  const [allowedAgents, setAllowedAgents] = useState([]);

  // New user agent configuration states (legacy - still used by generateExistingUserConfigurations for edit)
  const [newUserAllowedCampaigns, setNewUserAllowedCampaigns] = useState([]);
  const [newUserAllowedMonetizePack, setNewUserAllowedMonetizePack] = useState([]);
  const [newUserAllowedAIAgents, setNewUserAllowedAIAgents] = useState([]);

  // New user simplified agent access (Add User drawer: one multi-select including qualification)
  const [newUserAllowedAgents, setNewUserAllowedAgents] = useState([]);

  // NOTE: We no longer use the separate UserConfiguration API / drawer.
  // Existing user configurations are loaded from `getUserForUpdateByAdmin` response
  // and saved via `updateUserByAdmin` in the Edit User drawer.

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
    setAllowedAgents([]);
  };

  const resetNewUserAgentStates = () => {
    setNewUserAllowedCampaigns([]);
    setNewUserAllowedMonetizePack([]);
    setNewUserAllowedAIAgents([]);
    setNewUserAllowedAgents([]);
  };

  const initializeExistingUserAgentStates = userConfigurations => {
    try {
      const lockedCampaigns = Array.isArray(userConfigurations?.lockedCampaigns)
        ? userConfigurations.lockedCampaigns
        : [];
      const lockedAIAgents = Array.isArray(userConfigurations?.lockedAIAgents)
        ? userConfigurations.lockedAIAgents
        : [];
      const isQualificationLocked = userConfigurations?.isQualificationAgentLocked !== false;

      const selected = [];
      if (!lockedAIAgents.includes(DEA_VALUE)) selected.push(DEA_VALUE);
      CAMPAIGN_ACCESS_VALUES.forEach(v => {
        if (!lockedCampaigns.includes(v)) selected.push(v);
      });
      if (!isQualificationLocked) selected.push(QUALIFICATION_VALUE);

      setAllowedAgents(selected);
    } catch (error) {
      setAllowedAgents([...CAMPAIGN_ACCESS_VALUES, DEA_VALUE, QUALIFICATION_VALUE]);
      notification.error({
        message: 'Error',
        description: 'Failed to load user agent configuration. Defaulted to full access.',
      });
    }
  };

  const generateExistingUserConfigurations = () => {
    const selected = allowedAgents || [];
    const lockedAIAgents = selected.includes(DEA_VALUE) ? [] : [DEA_VALUE];
    const lockedCampaigns = CAMPAIGN_ACCESS_VALUES.filter(v => !selected.includes(v));
    const isQualificationAgentLocked = !selected.includes(QUALIFICATION_VALUE);
    return {
      lockedCampaigns,
      lockedAIAgents,
      lockedSmartReplyAgents: [],
      isQualificationAgentLocked,
    };
  };

  const generateNewUserConfigurations = () => {
    // Selected = what user chose in the multi-select (DEA, rag, pollingAgent, affiliateLink, qualification).
    // Locked = not selected. Qualification is a boolean: isQualificationAgentLocked = not selected.
    const selected = newUserAllowedAgents || [];
    const lockedAIAgents = selected.includes(DEA_VALUE) ? [] : [DEA_VALUE];
    const lockedCampaigns = CAMPAIGN_ACCESS_VALUES.filter(v => !selected.includes(v));
    const isQualificationAgentLocked = !selected.includes(QUALIFICATION_VALUE);
    return {
      lockedCampaigns,
      lockedAIAgents,
      lockedSmartReplyAgents: [],
      isQualificationAgentLocked,
    };
  };

  return {
    // Existing user states (edit user drawer – simplified same as Add User)
    allowedAgents,
    setAllowedAgents,

    // New user states
    newUserAllowedCampaigns,
    newUserAllowedMonetizePack,
    newUserAllowedAIAgents,
    setNewUserAllowedCampaigns,
    setNewUserAllowedMonetizePack,
    setNewUserAllowedAIAgents,
    newUserAllowedAgents,
    setNewUserAllowedAgents,

    // Existing user handlers (edit user drawer)
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
