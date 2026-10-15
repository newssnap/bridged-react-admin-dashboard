import { useState } from 'react';
import { useLazyGetAgentVisitorFrequencyQuery } from '../../../services/api';
import { getApiErrorText } from './agentReportMetrics';

// Loads the per-agent "visitor frequency" breakdown on demand (requested by the AM team).
export const useAgentReportVisitorFrequency = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [_GET_AGENT_VISITOR_FREQUENCY, { currentData, error, isFetching }] =
    useLazyGetAgentVisitorFrequencyQuery();

  const openVisitorFrequency = agent => {
    if (!agent?.agentId || !agent?.startDate || !agent?.endDate) return;
    setSelectedAgent(agent);
    _GET_AGENT_VISITOR_FREQUENCY({
      agentId: agent.agentId,
      startDate: agent.startDate,
      endDate: agent.endDate,
    });
  };

  const closeVisitorFrequency = () => setSelectedAgent(null);

  const responseError = currentData && !currentData.success ? currentData : null;

  return {
    selectedAgent,
    isVisitorFrequencyOpen: Boolean(selectedAgent),
    openVisitorFrequency,
    closeVisitorFrequency,
    visitorFrequency: currentData?.success ? currentData.data : null,
    isVisitorFrequencyLoading: isFetching,
    visitorFrequencyErrorText:
      error?.status === 503
        ? 'This date range is too heavy to compute — try a shorter range.'
        : error || responseError
          ? getApiErrorText(error || responseError)
          : null,
  };
};
