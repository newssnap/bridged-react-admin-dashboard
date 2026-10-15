import { useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import {
  useCreateAgentReportMutation,
  useGetAgentReportResultQuery,
  useGetAgentReportStatusQuery,
} from '../../../services/api';
import {
  AGENT_REPORT_POLL_INTERVAL_MS,
  AGENT_REPORT_TERMINAL_STATUSES,
  AGENT_REPORT_TYPES,
  DEFAULT_AGENT_REPORT_TYPE,
  detectAgentReportType,
  getAgentDataTypeLabel,
} from '../../../constants/agentReportTypes';
import {
  buildAgentRecords,
  buildDeviceUsage,
  buildReportTotals,
  evaluateMetric,
  getApiErrorText,
  isNotFoundError,
  summarizeCampaignDates,
  toPlainAgentError,
} from './agentReportMetrics';
import { downloadAgentReportExcel, getOrderedSheetNames } from './agentReportExcel';
import { useAgentReportRecent } from './useAgentReportRecent';

// A non-404 4xx will not fix itself, so polling stops; 5xx / network errors keep retrying.
const isPermanentError = error =>
  typeof error?.status === 'number' && error.status >= 400 && error.status < 500;

export const useAgentReportHandler = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(AGENT_REPORT_POLL_INTERVAL_MS);

  const {
    recentReports,
    saveRecentReport,
    patchRecentReport,
    removeRecentReport,
    clearRecentReports,
  } = useAgentReportRecent();

  const [_CREATE_AGENT_REPORT, { isLoading: isSubmitting }] = useCreateAgentReportMutation();

  const reportId = activeReport?.reportId;

  // Polling stops automatically when the component unmounts (RTK Query unsubscribes).
  // currentData (not data) so a previous report's status never leaks into a newly opened one.
  const {
    currentData: statusResponse,
    error: statusRequestError,
    isLoading: isStatusLoading,
  } = useGetAgentReportStatusQuery(reportId, {
    skip: !reportId,
    pollingInterval,
    refetchOnMountOrArgChange: true,
  });

  const statusData = statusResponse?.success ? statusResponse.data : null;
  const statusError =
    statusRequestError || (statusResponse && !statusResponse.success ? statusResponse : null);
  const isExpired = isNotFoundError(statusRequestError);
  const reportStatus = statusData?.status;
  const isTerminal = AGENT_REPORT_TERMINAL_STATUSES.includes(reportStatus);
  const isReady = Boolean(statusData?.ready);

  const {
    currentData: resultResponse,
    error: resultRequestError,
    isFetching: isResultLoading,
    refetch: refetchResult,
  } = useGetAgentReportResultQuery(reportId, { skip: !reportId || !isReady });

  const result = resultResponse?.success ? resultResponse.data : null;
  const resultError =
    resultRequestError || (resultResponse && !resultResponse.success ? resultResponse : null);
  const isResultExpired = isNotFoundError(resultRequestError);

  // Restart polling for every newly opened report, stop it once there is nothing left to wait for.
  useEffect(() => {
    setPollingInterval(AGENT_REPORT_POLL_INTERVAL_MS);
  }, [reportId]);

  useEffect(() => {
    const shouldStop =
      isTerminal ||
      isExpired ||
      (statusResponse && !statusResponse.success) ||
      isPermanentError(statusRequestError);
    if (shouldStop) setPollingInterval(0);
  }, [isTerminal, isExpired, statusResponse, statusRequestError]);

  // Keep the recent-reports entry in sync with what the backend tells us.
  useEffect(() => {
    if (!reportId || !statusData) return;
    const agentNames = {};
    (statusData.agents || []).forEach(agent => {
      if (agent.agentName) agentNames[agent.agentId] = agent.agentName;
    });
    const changes = {
      expiresAt: statusData.expiresAt || null,
      status: statusData.status,
      agentNames,
    };
    patchRecentReport(reportId, changes);
    setActiveReport(prev => (prev?.reportId === reportId ? { ...prev, ...changes } : prev));
  }, [reportId, statusData, patchRecentReport]);

  useEffect(() => {
    if (reportId && (isExpired || isResultExpired)) {
      patchRecentReport(reportId, { expired: true });
    }
  }, [reportId, isExpired, isResultExpired, patchRecentReport]);

  const submitReport = useCallback(
    async (campaigns, agentType) => {
      setSubmitError(null);
      try {
        const response = await _CREATE_AGENT_REPORT({ campaigns }).unwrap();
        if (!response?.success) throw response;
        const entry = {
          reportId: response.data.reportId,
          agentType,
          campaigns,
          agentNames: {},
          status: response.data.status,
          createdAt: new Date().toISOString(),
          expiresAt: null,
        };
        setActiveReport(entry);
        saveRecentReport(entry);
        notification.success({
          message: 'Report queued',
          description: `Generating a report for ${response.data.agentCount ?? campaigns.length} agent(s). This usually takes 30 seconds to 5 minutes.`,
          placement: 'bottomRight',
        });
        return entry;
      } catch (error) {
        const errorText = getApiErrorText(error, 'The report could not be started.');
        setSubmitError(errorText);
        notification.error({
          message: 'Report could not be started',
          description: errorText,
          placement: 'bottomRight',
        });
        return null;
      }
    },
    [_CREATE_AGENT_REPORT, saveRecentReport]
  );

  const runAgain = useCallback(() => {
    if (!activeReport) return null;
    return submitReport(activeReport.campaigns, activeReport.agentType);
  }, [activeReport, submitReport]);

  const openRecentReport = useCallback(entry => {
    setSubmitError(null);
    setActiveReport({ ...entry });
  }, []);

  const closeReport = useCallback(() => setActiveReport(null), []);

  const setViewType = useCallback(
    agentType => {
      if (!reportId) return;
      setActiveReport(prev => ({ ...prev, agentType, typeDetectedFromData: false }));
      patchRecentReport(reportId, { agentType, typeDetectedFromData: false });
    },
    [reportId, patchRecentReport]
  );

  // ---------- Derived view data ----------

  const agentType = AGENT_REPORT_TYPES[activeReport?.agentType]
    ? activeReport.agentType
    : DEFAULT_AGENT_REPORT_TYPE;
  const typeConfig = AGENT_REPORT_TYPES[agentType];
  const campaigns = useMemo(() => activeReport?.campaigns || [], [activeReport]);
  const agentNames = useMemo(() => activeReport?.agentNames || {}, [activeReport]);
  const dateSummary = useMemo(() => summarizeCampaignDates(campaigns), [campaigns]);

  const statusAgents = useMemo(
    () =>
      (statusData?.agents || []).map(agent => ({
        ...agent,
        plainError: agent.status === 'failed' ? toPlainAgentError(agent.error) : null,
      })),
    [statusData]
  );
  const failedAgents = statusAgents.filter(agent => agent.status === 'failed');

  const agentRecords = useMemo(
    () => (result ? buildAgentRecords(result, statusData?.agents) : []),
    [result, statusData]
  );

  // Default the view type from the data once per report (the AM can still change it).
  useEffect(() => {
    if (!reportId || !result || activeReport?.typeDefaulted) return;
    const detectedType = detectAgentReportType(
      agentRecords.map(record => record.agentType),
      activeReport?.agentType
    );
    const changes = { typeDefaulted: true };
    if (detectedType && detectedType !== activeReport?.agentType) {
      changes.agentType = detectedType;
      changes.typeDetectedFromData = true;
    }
    setActiveReport(prev => (prev?.reportId === reportId ? { ...prev, ...changes } : prev));
    patchRecentReport(reportId, changes);
  }, [reportId, result, agentRecords, activeReport, patchRecentReport]);

  const deviceUsage = useMemo(
    () => (result ? buildDeviceUsage(result, agentRecords) : []),
    [result, agentRecords]
  );

  const kpis = useMemo(() => {
    if (!result) return [];
    const totals = buildReportTotals(agentRecords);
    return typeConfig.kpis.map(metricKey => evaluateMetric(metricKey, totals)).filter(Boolean);
  }, [result, agentRecords, typeConfig]);

  const agentTableRows = useMemo(() => {
    if (!result) return [];
    const recordsById = new Map(agentRecords.map(record => [record.agentId, record]));
    const campaignIds = campaigns.map(campaign => campaign.id);
    const extraIds = agentRecords
      .map(record => record.agentId)
      .filter(agentId => !campaignIds.includes(agentId));

    return [...campaignIds, ...extraIds].map(agentId => {
      const record = recordsById.get(agentId);
      const campaign = campaigns.find(item => item.id === agentId);
      const metrics = {};
      if (record) {
        const totals = buildReportTotals([record]);
        typeConfig.tableMetrics.forEach(metricKey => {
          metrics[metricKey] = evaluateMetric(metricKey, totals);
        });
      }
      return {
        key: agentId,
        agentId,
        agentName: record?.agentName || agentNames[agentId] || null,
        agentDataTypeLabel: record ? getAgentDataTypeLabel(record.agentType) : null,
        startDate: campaign?.startDate,
        endDate: campaign?.endDate,
        hasData: Boolean(record),
        metrics,
      };
    });
  }, [result, agentRecords, campaigns, agentNames, typeConfig]);

  const visibleSheetNames = useMemo(() => {
    if (!result) return [];
    return getOrderedSheetNames(result).filter(sheetName => {
      if (!typeConfig.hiddenSheetsWhenEmpty.includes(sheetName)) return true;
      return (result.sheets[sheetName]?.rows?.length || 0) > 0;
    });
  }, [result, typeConfig]);

  const firstAgentName =
    campaigns.length === 1 ? agentNames[campaigns[0].id] || agentTableRows[0]?.agentName : null;

  // leadActions: optional lead sheets (see useAgentReportLeads) appended after the report sheets.
  const downloadExcel = useCallback(
    (leadActions = []) => {
      if (!result) return;
      try {
        downloadAgentReportExcel(result, campaigns, firstAgentName, leadActions);
      } catch (error) {
        notification.error({
          message: 'Excel download failed',
          description: error?.message || 'The workbook could not be created.',
          placement: 'bottomRight',
        });
      }
    },
    [result, campaigns, firstAgentName]
  );

  // Future: an "AI insights" panel will consume { result, kpis, agentTableRows, typeConfig } here.

  return {
    // request lifecycle
    submitReport,
    isSubmitting,
    submitError,
    runAgain,
    closeReport,
    // status
    activeReport,
    statusData,
    statusAgents,
    failedAgents,
    statusError,
    statusErrorText: statusError ? getApiErrorText(statusError) : null,
    isStatusLoading,
    isPolling: Boolean(reportId) && pollingInterval > 0,
    isTerminal,
    isReady,
    isExpired: isExpired || isResultExpired,
    // result
    result,
    resultErrorText: resultError && !isResultExpired ? getApiErrorText(resultError) : null,
    isResultLoading,
    refetchResult,
    agentType,
    typeConfig,
    setViewType,
    typeDetectedFromData: Boolean(activeReport?.typeDetectedFromData),
    deviceUsage,
    campaigns,
    agentNames,
    dateSummary,
    kpis,
    agentTableRows,
    visibleSheetNames,
    hasSheets: visibleSheetNames.length > 0,
    downloadExcel,
    firstAgentName,
    // recent reports
    recentReports,
    openRecentReport,
    removeRecentReport,
    clearRecentReports,
  };
};
