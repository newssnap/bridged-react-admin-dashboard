import { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import {
  AGENT_ID_PATTERN,
  AGENT_REPORT_DATE_FORMAT,
  AGENT_REPORT_MAX_CAMPAIGNS,
  DEFAULT_AGENT_REPORT_TYPE,
} from '../../../constants/agentReportTypes';

let rowKeySeed = 0;
const createRow = (agentId = '', range = null) => {
  rowKeySeed += 1;
  return {
    key: `row-${Date.now()}-${rowKeySeed}`,
    agentId,
    range,
  };
};

const defaultRange = () => [dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')];

// Splits pasted text on new lines, commas, semicolons, tabs and spaces.
const parseAgentIds = text => [
  ...new Set(
    text
      .split(/[\s,;]+/)
      .map(id => id.trim())
      .filter(Boolean)
  ),
];

const validateRow = row => {
  const errors = [];
  const agentId = row.agentId.trim();
  if (!agentId) errors.push('Agent ID is required');
  else if (!AGENT_ID_PATTERN.test(agentId)) {
    errors.push('Agent ID must be 24 characters (0-9, a-f)');
  }
  const [start, end] = row.range || [];
  if (!start || !end) errors.push('Select a start and end date');
  else if (start.isAfter(end, 'day')) errors.push('Start date must be on or before end date');
  return errors;
};

export const useAgentReportForm = () => {
  const [agentType, setAgentType] = useState(DEFAULT_AGENT_REPORT_TYPE);
  const [rows, setRows] = useState(() => [createRow('', defaultRange())]);
  const [bulkRange, setBulkRange] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [rowErrors, setRowErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [pasteNotice, setPasteNotice] = useState(null);

  const clearRowError = key =>
    setRowErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const canAddRow = rows.length < AGENT_REPORT_MAX_CAMPAIGNS;

  const addRow = () => {
    if (!canAddRow) return;
    setRows(prev => [...prev, createRow('', bulkRange || defaultRange())]);
  };

  const removeRow = key => {
    setRows(prev => (prev.length > 1 ? prev.filter(row => row.key !== key) : prev));
    clearRowError(key);
  };

  const updateRow = (key, changes) => {
    setRows(prev => prev.map(row => (row.key === key ? { ...row, ...changes } : row)));
    clearRowError(key);
  };

  // Adds one row per pasted ID (trimmed, de-duplicated against the paste and existing rows).
  const addPastedIds = () => {
    const ids = parseAgentIds(pasteText);
    if (!ids.length) return;
    const keptRows = rows.filter(row => row.agentId.trim());
    const existingIds = new Set(keptRows.map(row => row.agentId.trim()));
    const newIds = ids.filter(id => !existingIds.has(id));
    const room = Math.max(AGENT_REPORT_MAX_CAMPAIGNS - keptRows.length, 0);
    const addedIds = newIds.slice(0, room);
    const skippedDuplicates = ids.length - newIds.length;
    const skippedOverLimit = newIds.length - addedIds.length;

    const nextRows = [
      ...keptRows,
      ...addedIds.map(id => createRow(id, bulkRange || defaultRange())),
    ];
    // Never leave the form without a row.
    setRows(nextRows.length ? nextRows : [createRow('', bulkRange || defaultRange())]);
    setPasteText('');

    const notes = [];
    if (skippedDuplicates)
      notes.push(
        `${skippedDuplicates} duplicate ${skippedDuplicates === 1 ? 'ID' : 'IDs'} skipped`
      );
    if (skippedOverLimit) {
      notes.push(
        `${skippedOverLimit} ${skippedOverLimit === 1 ? 'ID' : 'IDs'} not added — a report can include at most ${AGENT_REPORT_MAX_CAMPAIGNS} unique agents`
      );
    }
    setPasteNotice(
      `Added ${addedIds.length} ${addedIds.length === 1 ? 'row' : 'rows'}${notes.length ? `. ${notes.join('; ')}.` : '.'}`
    );
    setFormError(null);
  };

  const applyBulkRangeToAll = () => {
    if (!bulkRange?.[0] || !bulkRange?.[1]) return;
    setRows(prev => prev.map(row => ({ ...row, range: bulkRange })));
    setRowErrors({});
  };

  // Returns the request payload or null when the form is invalid.
  const buildCampaigns = () => {
    const errors = {};
    const seenIds = new Set();
    rows.forEach(row => {
      const rowValidation = validateRow(row);
      const agentId = row.agentId.trim();
      if (agentId && seenIds.has(agentId)) {
        rowValidation.push('This agent is already in the list — each agent can appear once');
      }
      seenIds.add(agentId);
      if (rowValidation.length) errors[row.key] = rowValidation;
    });
    setRowErrors(errors);

    if (Object.keys(errors).length) {
      setFormError(
        `Fix the ${Object.keys(errors).length === 1 ? 'highlighted row' : `${Object.keys(errors).length} highlighted rows`} before generating the report.`
      );
      return null;
    }
    if (rows.length > AGENT_REPORT_MAX_CAMPAIGNS) {
      setFormError(
        `A report can include at most ${AGENT_REPORT_MAX_CAMPAIGNS} unique agents — you have ${rows.length}. Split them into several reports.`
      );
      return null;
    }
    setFormError(null);
    return rows.map(row => ({
      id: row.agentId.trim(),
      startDate: row.range[0].format(AGENT_REPORT_DATE_FORMAT),
      endDate: row.range[1].format(AGENT_REPORT_DATE_FORMAT),
    }));
  };

  // Loads a previous request back into the form (used when reopening a recent report).
  const loadCampaigns = useCallback((campaigns = [], type) => {
    if (type) setAgentType(type);
    if (!campaigns.length) return;
    setRows(
      campaigns.map(campaign =>
        createRow(campaign.id, [dayjs(campaign.startDate), dayjs(campaign.endDate)])
      )
    );
    setRowErrors({});
    setFormError(null);
    setPasteNotice(null);
  }, []);

  return {
    agentType,
    setAgentType,
    rows,
    addRow,
    canAddRow,
    removeRow,
    updateRow,
    pasteText,
    setPasteText,
    pastedIdCount: parseAgentIds(pasteText).length,
    addPastedIds,
    pasteNotice,
    bulkRange,
    setBulkRange,
    applyBulkRangeToAll,
    rowErrors,
    formError,
    buildCampaigns,
    loadCampaigns,
  };
};
