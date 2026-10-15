import { useCallback, useState } from 'react';
import {
  AGENT_REPORT_RECENT_LIMIT,
  AGENT_REPORT_RECENT_STORAGE_KEY,
} from '../../../constants/agentReportTypes';

const readRecentReports = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(AGENT_REPORT_RECENT_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(entry => entry?.reportId) : [];
  } catch (error) {
    return [];
  }
};

const writeRecentReports = entries => {
  try {
    localStorage.setItem(AGENT_REPORT_RECENT_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    // Storage can be full or blocked; the list is a convenience, so fail silently.
  }
};

// Recent reports are kept per browser in localStorage. Shape:
// { reportId, agentType, campaigns, agentNames, createdAt, expiresAt, expired }
export const useAgentReportRecent = () => {
  const [recentReports, setRecentReports] = useState(readRecentReports);

  const updateEntries = useCallback(updater => {
    setRecentReports(prev => {
      const next = updater(prev).slice(0, AGENT_REPORT_RECENT_LIMIT);
      writeRecentReports(next);
      return next;
    });
  }, []);

  const saveRecentReport = useCallback(
    entry =>
      updateEntries(prev => [entry, ...prev.filter(item => item.reportId !== entry.reportId)]),
    [updateEntries]
  );

  const patchRecentReport = useCallback(
    (reportId, changes) =>
      updateEntries(prev =>
        prev.map(item => (item.reportId === reportId ? { ...item, ...changes } : item))
      ),
    [updateEntries]
  );

  const removeRecentReport = useCallback(
    reportId => updateEntries(prev => prev.filter(item => item.reportId !== reportId)),
    [updateEntries]
  );

  const clearRecentReports = useCallback(() => updateEntries(() => []), [updateEntries]);

  return {
    recentReports,
    saveRecentReport,
    patchRecentReport,
    removeRecentReport,
    clearRecentReports,
  };
};
