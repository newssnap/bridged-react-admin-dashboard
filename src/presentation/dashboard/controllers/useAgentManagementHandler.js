import { useState, useEffect } from 'react';
import { notification } from 'antd';
import {
  useLazyGetUserConfigurationQuery,
  useUpdateUserConfigurationMutation,
} from '../../../services/api';
import {
  CAMPAIGN_OPTIONS,
  MONETIZE_PACK_OPTIONS,
  AI_AGENT_OPTIONS,
} from '../../../constants/agents';

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
    setAllowedCampaigns(CAMPAIGN_OPTIONS.map(o => o.value));
  };

  const handleClearCampaigns = () => {
    setAllowedCampaigns([]);
  };

  const handleSelectAllAIAgents = () => {
    setAllowedAIAgents(AI_AGENT_OPTIONS.map(o => o.value));
  };

  const handleClearAIAgents = () => {
    setAllowedAIAgents([]);
  };

  const handleSelectAllMonetizePack = () => {
    setAllowedMonetizePack(MONETIZE_PACK_OPTIONS.map(o => o.value));
  };

  const handleClearMonetizePack = () => {
    setAllowedMonetizePack([]);
  };

  // New user agent management handlers
  const handleSelectAllNewUserCampaigns = () => {
    setNewUserAllowedCampaigns(CAMPAIGN_OPTIONS.map(o => o.value));
  };

  const handleClearNewUserCampaigns = () => {
    setNewUserAllowedCampaigns([]);
  };

  const handleSelectAllNewUserAIAgents = () => {
    setNewUserAllowedAIAgents(AI_AGENT_OPTIONS.map(o => o.value));
  };

  const handleClearNewUserAIAgents = () => {
    setNewUserAllowedAIAgents([]);
  };

  const handleSelectAllNewUserMonetizePack = () => {
    setNewUserAllowedMonetizePack(MONETIZE_PACK_OPTIONS.map(o => o.value));
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

      console.log('API Response:', { lockedCampaigns, lockedAIAgents });
      console.log(
        'Available Campaign Options:',
        CAMPAIGN_OPTIONS.map(opt => opt.value)
      );
      console.log(
        'Available Monetize Pack Options:',
        MONETIZE_PACK_OPTIONS.map(opt => opt.value)
      );
      console.log(
        'Available AI Agent Options:',
        AI_AGENT_OPTIONS.map(opt => opt.value)
      );

      // Convert locked to allowed (opposite logic)
      // If agent is locked, it should NOT be in allowed list
      const allowedCampaignsList = CAMPAIGN_OPTIONS.filter(
        opt => !lockedCampaigns.includes(opt.value)
      ).map(opt => opt.value);
      const allowedMonetizePackList = MONETIZE_PACK_OPTIONS.filter(
        opt => !lockedCampaigns.includes(opt.value)
      ).map(opt => opt.value);
      const allowedAIAgentsList = AI_AGENT_OPTIONS.filter(
        opt => !lockedAIAgents.includes(opt.value)
      ).map(opt => opt.value);

      console.log('Converted to allowed:', {
        allowedCampaignsList,
        allowedMonetizePackList,
        allowedAIAgentsList,
      });

      setAllowedCampaigns(allowedCampaignsList);
      setAllowedMonetizePack(allowedMonetizePackList);
      setAllowedAIAgents(allowedAIAgentsList);
    } catch (error) {
      console.error('Error fetching user config:', error);
      // If there's an error, set all agents as allowed (default state)
      setAllowedCampaigns(CAMPAIGN_OPTIONS.map(opt => opt.value));
      setAllowedMonetizePack(MONETIZE_PACK_OPTIONS.map(opt => opt.value));
      setAllowedAIAgents(AI_AGENT_OPTIONS.map(opt => opt.value));
      notification.error({
        message: 'Error',
        description: 'Failed to fetch user configuration.',
      });
    }
  };

  // Close agents drawer
  const handleCloseAgentsDrawer = () => {
    setSelectedUserForAgents(null);
    setAllowedCampaigns([]);
    setAllowedMonetizePack([]);
    setAllowedAIAgents([]);
  };

  // Save agents configuration for existing user
  const handleSaveAgentsConfig = async () => {
    if (!selectedUserForAgents?._id) return;
    try {
      // Convert allowed to locked (opposite logic)
      // Combine campaigns and monetize pack for lockedCampaigns since monetize pack behaves as campaign
      const allCampaignValues = [...CAMPAIGN_OPTIONS, ...MONETIZE_PACK_OPTIONS].map(
        opt => opt.value
      );
      const allAllowedCampaignValues = [...allowedCampaigns, ...allowedMonetizePack];

      const lockedCampaigns = allCampaignValues.filter(
        opt => !allAllowedCampaignValues.includes(opt)
      );
      const lockedAIAgents = AI_AGENT_OPTIONS.filter(
        opt => !allowedAIAgents.includes(opt.value)
      ).map(opt => opt.value);

      await updateUserConfiguration({
        userId: selectedUserForAgents._id,
        lockedCampaigns,
        lockedAIAgents,
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

  // Reset new user agent configuration states
  const resetNewUserAgentStates = () => {
    setNewUserAllowedCampaigns([]);
    setNewUserAllowedMonetizePack([]);
    setNewUserAllowedAIAgents([]);
  };

  // Generate user configurations for new user
  const generateNewUserConfigurations = () => {
    // Convert allowed to locked (opposite logic) for new user
    // Combine campaigns and monetize pack for lockedCampaigns since monetize pack behaves as campaign
    const allCampaignValues = [...CAMPAIGN_OPTIONS, ...MONETIZE_PACK_OPTIONS].map(opt => opt.value);
    const allAllowedCampaignValues = [...newUserAllowedCampaigns, ...newUserAllowedMonetizePack];

    const lockedCampaigns = allCampaignValues.filter(
      opt => !allAllowedCampaignValues.includes(opt)
    );
    const lockedAIAgents = AI_AGENT_OPTIONS.filter(
      opt => !newUserAllowedAIAgents.includes(opt.value)
    ).map(opt => opt.value);

    return {
      lockedCampaigns,
      lockedAIAgents,
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
