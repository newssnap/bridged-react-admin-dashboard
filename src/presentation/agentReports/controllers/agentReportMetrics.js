import dayjs from 'dayjs';
import {
  AGENT_ERROR_HINTS,
  AGENT_REPORT_DISPLAY_DATE_FORMAT,
  AGENT_REPORT_METRICS,
  LOW_SAMPLE_THRESHOLD,
  SHEET_NAMES,
} from '../../../constants/agentReportTypes';

// ---------- Generic parsing / formatting ----------

export const toNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(/[,%\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

// Accepts seconds (number or numeric string), "hh:mm:ss" / "mm:ss" or "1m 23s" style values.
export const toSeconds = value => {
  const numeric = toNumber(value);
  if (numeric !== null) return numeric;
  if (typeof value !== 'string') return null;

  if (/^\d+(:\d{1,2}){1,2}(\.\d+)?$/.test(value.trim())) {
    return value
      .trim()
      .split(':')
      .reduce((total, part) => total * 60 + Number(part), 0);
  }

  const units = { h: 3600, m: 60, s: 1 };
  const matches = [...value.matchAll(/(\d+(?:\.\d+)?)\s*([hms])/gi)];
  if (!matches.length) return null;
  return matches.reduce(
    (total, [, amount, unit]) => total + Number(amount) * units[unit.toLowerCase()],
    0
  );
};

export const formatCount = value =>
  value === null || value === undefined ? '—' : Math.round(value).toLocaleString();

export const formatPercent = value =>
  value === null || value === undefined ? '—' : `${(value * 100).toFixed(1)}%`;

export const formatDuration = seconds => {
  if (seconds === null || seconds === undefined) return '—';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

export const formatDisplayDate = value =>
  value ? dayjs(value).format(AGENT_REPORT_DISPLAY_DATE_FORMAT) : '—';

export const formatDateTime = value => (value ? dayjs(value).format('D MMM YYYY, HH:mm') : '—');

// ---------- Errors ----------

// Works for RTK Query errors ({ status, data }) and for `{ success: false, errorObject }` bodies.
export const getApiErrorText = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.data?.errorObject?.userErrorText ||
  error?.errorObject?.userErrorText ||
  error?.data?.message ||
  (typeof error?.error === 'string' ? error.error : null) ||
  fallback;

export const isNotFoundError = error => error?.status === 404 || error?.originalStatus === 404;

export const toPlainAgentError = error => {
  if (!error) return 'No data could be generated for this agent.';
  const text = typeof error === 'string' ? error : getApiErrorText(error, '');
  const hint = AGENT_ERROR_HINTS.find(({ match }) => match.test(text));
  return hint ? hint.text : text || 'No data could be generated for this agent.';
};

// ---------- Campaign dates ----------

export const summarizeCampaignDates = (campaigns = []) => {
  if (!campaigns.length) return { startDate: null, endDate: null, isUniform: true };
  const startDates = campaigns.map(campaign => campaign.startDate).sort();
  const endDates = campaigns.map(campaign => campaign.endDate).sort();
  const isUniform = campaigns.every(
    campaign =>
      campaign.startDate === campaigns[0].startDate && campaign.endDate === campaigns[0].endDate
  );
  return { startDate: startDates[0], endDate: endDates[endDates.length - 1], isUniform };
};

// ---------- Sheets ----------

export const getSheet = (result, sheetName) => result?.sheets?.[sheetName] || null;

export const getSheetRows = (result, sheetName) => {
  const sheet = getSheet(result, sheetName);
  return Array.isArray(sheet?.rows) ? sheet.rows : [];
};

export const getAgentIdFromRow = row =>
  String(row?.['Agent ID'] ?? row?.AgentID ?? row?.agentId ?? row?.['Agent Id'] ?? '').trim();

// Merges Campaign Stats, KPI Analysis and Agent Summary into one record per agent.
export const buildAgentRecords = (result, statusAgents = []) => {
  const records = new Map();
  const ensureRecord = agentId => {
    if (!records.has(agentId)) {
      records.set(agentId, { agentId, agentName: null, agentType: null });
    }
    return records.get(agentId);
  };

  [
    [SHEET_NAMES.CAMPAIGN_STATS, 'stats'],
    [SHEET_NAMES.KPI_ANALYSIS, 'kpi'],
    [SHEET_NAMES.AGENT_SUMMARY, 'summary'],
  ].forEach(([sheetName, field]) => {
    getSheetRows(result, sheetName).forEach(row => {
      const agentId = getAgentIdFromRow(row);
      if (!agentId) return;
      const record = ensureRecord(agentId);
      record[field] = row;
      record.agentName = record.agentName || row['Agent Name'] || null;
      if (record.agentType === null && row['Agent Type'] !== undefined) {
        record.agentType = row['Agent Type'];
      }
    });
  });

  statusAgents.forEach(agent => {
    const record = records.get(agent.agentId);
    if (record && !record.agentName) record.agentName = agent.agentName || null;
  });

  return [...records.values()];
};

const sumField = (records, source, field) => {
  const values = records.map(record => toNumber(record[source]?.[field])).filter(v => v !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
};

// Weighted mean; falls back to a plain mean when no weights are available.
const weightedAverage = (records, valueGetter, weightGetter) => {
  const pairs = records
    .map(record => ({ value: valueGetter(record), weight: weightGetter(record) }))
    .filter(({ value }) => value !== null);
  if (!pairs.length) return null;
  const totalWeight = pairs.reduce((total, { weight }) => total + (weight || 0), 0);
  if (totalWeight > 0) {
    return (
      pairs.reduce((total, { value, weight }) => total + value * (weight || 0), 0) / totalWeight
    );
  }
  return pairs.reduce((total, { value }) => total + value, 0) / pairs.length;
};

export const buildReportTotals = records => ({
  cardLoads: sumField(records, 'stats', 'cardLoads'),
  cardViews: sumField(records, 'stats', 'cardViews'),
  engagementTakes: sumField(records, 'stats', 'engagementTakes'),
  actionTakes: sumField(records, 'stats', 'actionTakes'),
  sessionCount: sumField(records, 'stats', 'sessionCount'),
  ragCount: sumField(records, 'stats', 'ragCount'),
  ragsWithReference: sumField(records, 'stats', 'ragsWithReference'),
  ragsWithoutReference: sumField(records, 'stats', 'ragsWithoutReference'),
  handOffRags: sumField(records, 'stats', 'handOffRags'),
  unanswered: sumField(records, 'stats', 'unanswered'),
  engagedVisitors: sumField(records, 'kpi', 'Total Engaged Visitors'),
  nonEngagedVisitors: sumField(records, 'kpi', 'Total Non Engaged Visitors'),
  uniqueVisitors: sumField(records, 'kpi', 'Total Unique Visitors'),
  engagedCameBack: sumField(records, 'kpi', 'Visitors Engaged and Came Back'),
  engagedCameBackEngagedAgain: sumField(
    records,
    'kpi',
    'Visitors Who Engaged, Came Back, and Engaged Again'
  ),
  neverEngagedCameBack: sumField(records, 'kpi', 'Visitors Never Engaged and Came Back'),
  leadsCollected: sumField(records, 'summary', 'Leads Collection'),
  leadsWithEmails: sumField(records, 'summary', 'Leads with Emails'),
  leadsWithoutEmails: sumField(records, 'summary', 'Leads without Emails'),
  avgTimeWithEngagement: weightedAverage(
    records,
    record => toSeconds(record.stats?.avgTimeSpentWithEngagement),
    record => toNumber(record.kpi?.['Total Engaged Visitors'])
  ),
  avgTimeWithoutEngagement: weightedAverage(
    records,
    record => toSeconds(record.stats?.avgTimeSpentWithoutEngagement),
    record => toNumber(record.kpi?.['Total Non Engaged Visitors'])
  ),
});

// Applies the data-honesty rules (artifact rates, low samples) to a single metric.
export const evaluateMetric = (metricKey, totals) => {
  const metric = AGENT_REPORT_METRICS[metricKey];
  if (!metric) return null;
  const value = metric.compute(totals);
  const isArtifact =
    metric.kind === 'rate' &&
    metric.maxPlausible !== undefined &&
    value !== null &&
    value > metric.maxPlausible;
  const isLowSample =
    Boolean(metric.sampleSensitive) &&
    totals.engagedVisitors !== null &&
    totals.engagedVisitors < LOW_SAMPLE_THRESHOLD;

  let display;
  let secondaryDisplay = null;
  if (metric.kind === 'rate') display = formatPercent(value);
  else if (metric.kind === 'time') display = formatDuration(value);
  else if (metric.kind === 'timePair') {
    display = formatDuration(value?.primary);
    secondaryDisplay = formatDuration(value?.secondary);
  } else display = formatCount(value);

  const hasValue =
    metric.kind === 'timePair'
      ? value?.primary !== null || value?.secondary !== null
      : value !== null && value !== undefined;

  return {
    key: metricKey,
    ...metric,
    value,
    display,
    secondaryDisplay,
    hasValue,
    isArtifact,
    isLowSample,
  };
};

// ---------- Device usage ----------

const DEVICE_TYPES = ['Mobile', 'Tablet', 'Desktop', 'Unknown'];

const matchDevice = text =>
  DEVICE_TYPES.find(device => new RegExp(`^${device}`, 'i').test(String(text || '').trim()));

// Device Base Usage per agent. Supports both a wide layout (one column per device) and a long
// layout (a device column plus a count column). Returns [] when the shape is not recognised.
export const buildDeviceUsage = (result, agentRecords = []) => {
  const rows = getSheetRows(result, SHEET_NAMES.DEVICE_BASE_USAGE);
  const names = new Map(agentRecords.map(record => [record.agentId, record.agentName]));
  const usage = new Map();
  const ensureAgent = (agentId, row) => {
    if (!usage.has(agentId)) {
      usage.set(agentId, {
        agentId,
        agentName: names.get(agentId) || row['Agent Name'] || null,
        counts: Object.fromEntries(DEVICE_TYPES.map(device => [device, 0])),
      });
    }
    return usage.get(agentId);
  };

  rows.forEach(row => {
    const agentId = getAgentIdFromRow(row);
    if (!agentId) return;
    const entries = Object.entries(row);
    const wideEntries = entries.filter(
      ([key, value]) => matchDevice(key) && toNumber(value) !== null
    );
    if (wideEntries.length) {
      const agent = ensureAgent(agentId, row);
      wideEntries.forEach(([key, value]) => {
        agent.counts[matchDevice(key)] += toNumber(value);
      });
      return;
    }
    const deviceEntry = entries.find(([, value]) => matchDevice(value));
    const countEntry = entries.find(
      ([key, value]) => !/id$/i.test(key) && typeof value !== 'boolean' && toNumber(value) !== null
    );
    if (deviceEntry && countEntry) {
      ensureAgent(agentId, row).counts[matchDevice(deviceEntry[1])] += toNumber(countEntry[1]);
    }
  });

  return [...usage.values()].map(agent => ({
    ...agent,
    total: DEVICE_TYPES.reduce((total, device) => total + agent.counts[device], 0),
  }));
};

export { DEVICE_TYPES };
