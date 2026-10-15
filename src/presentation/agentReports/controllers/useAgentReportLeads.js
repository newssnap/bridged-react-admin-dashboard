import { useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import { useGetAgentReportLeadsMutation } from '../../../services/api';
import { getApiErrorText } from './agentReportMetrics';
import { downloadLeadsExcel } from './agentReportExcel';

const VISITOR_ID_KEY = 'visitor_id';

// Union of keys across an action's leads, in first-seen order, with visitor_id last.
const buildLeadColumns = leadsData => {
  const keys = [];
  leadsData.forEach(lead => {
    Object.keys(lead || {}).forEach(key => {
      if (key !== VISITOR_ID_KEY && !keys.includes(key)) keys.push(key);
    });
  });
  return [...keys, VISITOR_ID_KEY];
};

// The leads endpoint takes one date range for many agents, so campaigns are grouped by range.
const groupCampaignsByDates = campaigns => {
  const groups = new Map();
  campaigns.forEach(({ id, startDate, endDate }) => {
    const key = `${startDate}|${endDate}`;
    if (!groups.has(key)) groups.set(key, { startDate, endDate, agentIds: [] });
    groups.get(key).agentIds.push(id);
  });
  return [...groups.values()];
};

// Loads leads (personal data) on demand for the agents and dates of the open report.
export const useAgentReportLeads = ({ reportId, campaigns, agentNames, firstAgentName }) => {
  const [_GET_AGENT_REPORT_LEADS] = useGetAgentReportLeadsMutation();
  const [leadActions, setLeadActions] = useState(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadsErrors, setLeadsErrors] = useState([]);
  const [includeLeadsInReport, setIncludeLeadsInReport] = useState(false);

  // Leads belong to one report request; never show them against another one.
  useEffect(() => {
    setLeadActions(null);
    setLeadsErrors([]);
    setIncludeLeadsInReport(false);
  }, [reportId]);

  const loadLeads = useCallback(async () => {
    if (!campaigns.length) return;
    setIsLoadingLeads(true);
    setLeadsErrors([]);
    const groups = groupCampaignsByDates(campaigns);
    const settled = await Promise.allSettled(
      groups.map(group => _GET_AGENT_REPORT_LEADS(group).unwrap())
    );

    const actions = [];
    const errors = [];
    settled.forEach((outcome, index) => {
      const { startDate, endDate } = groups[index];
      const response = outcome.status === 'fulfilled' ? outcome.value : null;
      if (!response?.success) {
        const errorText = getApiErrorText(
          outcome.status === 'rejected' ? outcome.reason : response,
          'Leads could not be loaded.'
        );
        errors.push(groups.length > 1 ? `${startDate} – ${endDate}: ${errorText}` : errorText);
        return;
      }
      (response.data || []).forEach(action => {
        const leadsData = Array.isArray(action.leadsData) ? action.leadsData : [];
        actions.push({
          key: `${action.agent_id}-${action._id}`,
          actionId: action._id,
          agentId: action.agent_id,
          agentName: action.agent_name || agentNames[action.agent_id] || action.agent_id,
          title: action.title || 'Untitled action',
          actionType: action.actionType || 'unknown',
          columns: buildLeadColumns(leadsData),
          rows: leadsData,
        });
      });
    });

    // Keep the agent order of the request.
    const order = campaigns.map(campaign => campaign.id);
    actions.sort((a, b) => order.indexOf(a.agentId) - order.indexOf(b.agentId));

    setLeadActions(actions);
    setLeadsErrors(errors);
    setIsLoadingLeads(false);
  }, [campaigns, agentNames, _GET_AGENT_REPORT_LEADS]);

  const leadsByAgent = useMemo(() => {
    if (!leadActions) return [];
    const agents = new Map();
    leadActions.forEach(action => {
      if (!agents.has(action.agentId)) {
        agents.set(action.agentId, {
          agentId: action.agentId,
          agentName: action.agentName,
          actions: [],
          leadCount: 0,
        });
      }
      const agent = agents.get(action.agentId);
      agent.actions.push(action);
      agent.leadCount += action.rows.length;
    });
    return [...agents.values()];
  }, [leadActions]);

  const totalLeads = leadsByAgent.reduce((total, agent) => total + agent.leadCount, 0);
  const hasLeads = totalLeads > 0;

  const downloadLeads = useCallback(() => {
    if (!leadActions?.length) return;
    try {
      downloadLeadsExcel(leadActions, campaigns, firstAgentName);
    } catch (error) {
      notification.error({
        message: 'Leads download failed',
        description: error?.message || 'The workbook could not be created.',
        placement: 'bottomRight',
      });
    }
  }, [leadActions, campaigns, firstAgentName]);

  return {
    loadLeads,
    isLoadingLeads,
    isLeadsLoaded: leadActions !== null,
    leadsErrors,
    leadsByAgent,
    totalLeads,
    hasLeads,
    downloadLeads,
    includeLeadsInReport: includeLeadsInReport && hasLeads,
    setIncludeLeadsInReport,
    // Lead sheets for the main report download, only when the toggle is on.
    reportLeadActions: includeLeadsInReport && hasLeads ? leadActions : [],
  };
};
