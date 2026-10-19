// Agent Reports configuration.
// Every metric rule (which KPIs each agent type shows, their labels, units and plausibility caps)
// lives here so adding a new agent type (e.g. WhatsApp, Voice) is a single entry in
// AGENT_REPORT_TYPES.

// The server caches report status for 8s, so polling faster than 10s gains nothing.
export const AGENT_REPORT_POLL_INTERVAL_MS = 10000;
// Enforced server side: at most 100 unique agents per report.
export const AGENT_REPORT_MAX_CAMPAIGNS = 100;
// Agent IDs are Mongo ObjectIds.
export const AGENT_ID_PATTERN = /^[a-f0-9]{24}$/i;
export const AGENT_REPORT_RECENT_STORAGE_KEY = 'bridgedAdmin.agentReports.recent';
export const AGENT_REPORT_RECENT_LIMIT = 20;
export const AGENT_REPORT_DATE_FORMAT = 'YYYY-MM-DD';
export const AGENT_REPORT_DISPLAY_DATE_FORMAT = 'D MMM YYYY';

// Below this many unique engaged visitors, loyalty and time figures are flagged as "low sample".
export const LOW_SAMPLE_THRESHOLD = 30;

export const RATE_ARTIFACT_TEXT =
  'n/a — tracking artifact, quote loads and unique engaged visitors instead';

export const AGENT_REPORT_TERMINAL_STATUSES = ['completed', 'partial', 'failed'];

export const AGENT_REPORT_STATUS_META = {
  queued: { label: 'Queued', color: 'default' },
  processing: { label: 'Processing', color: 'processing' },
  completed: { label: 'Completed', color: 'success' },
  partial: { label: 'Partially completed', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
};

export const AGENT_STATUS_META = {
  pending: { label: 'Waiting', color: 'default' },
  processing: { label: 'Processing', color: 'processing' },
  done: { label: 'Done', color: 'success' },
  failed: { label: 'No data', color: 'error' },
};

// Translates raw backend agent errors into something an Account Manager can act on.
export const AGENT_ERROR_HINTS = [
  {
    match: /not\s*found|invalid.*id|cast to objectid/i,
    text: 'Agent ID not found — check the ID.',
  },
  { match: /no\s*data|empty/i, text: 'No activity recorded for this agent in the selected dates.' },
  { match: /time\s*out|timed\s*out/i, text: 'Generation took too long — try running it again.' },
  { match: /permission|forbidden|unauthori/i, text: 'You do not have access to this agent.' },
];

// 'Agent Type' values as they appear in the report data.
export const AGENT_DATA_TYPE_LABELS = {
  rag: 'Knowledge',
  pollingAgent: 'Polling',
  dea: 'Data Explorer',
  xRay: 'Smart Reading',
  recirculation: 'Recirculation',
};
export const UNKNOWN_AGENT_DATA_TYPE_LABEL = 'Unknown type';

export const getAgentDataTypeLabel = value =>
  AGENT_DATA_TYPE_LABELS[value] || (value ? value : UNKNOWN_AGENT_DATA_TYPE_LABEL);

export const SHEET_NAMES = {
  DATA_REPORT: 'Data Report',
  CAMPAIGN_STATS: 'Campaign Stats',
  QUESTIONS_ANSWERS: 'Questions & Answers',
  QUESTIONS_ACTIONS: 'Questions & Actions',
  ACTION_DATA_ANALYSIS: 'Action Data Analysis',
  KPI_ANALYSIS: 'KPI Analysis',
  DEVICE_BASE_USAGE: 'Device Base Usage',
  AGENT_SUMMARY: 'Agent Summary',
  URL_CLICKS: 'URL Clicks',
  ACTION_TAKEN: 'Action Taken',
};

const QUESTION_SHEETS = [SHEET_NAMES.QUESTIONS_ANSWERS, SHEET_NAMES.QUESTIONS_ACTIONS];

const safeRatio = (numerator, denominator) =>
  denominator > 0 && numerator !== null && numerator !== undefined ? numerator / denominator : null;

// Metric catalogue. `compute` receives the totals produced by buildReportTotals
// (aggregated across agents, or for a single agent in the per-agent table).
// kind: 'count' | 'rate' | 'timePair' | 'time'
// unit: what is being counted — 'events' and 'people' must never be confused.
// maxPlausible: rates above this are rendered as tracking artifacts instead of a number.
// sampleSensitive: flag as "low sample" when engaged visitors < LOW_SAMPLE_THRESHOLD.
export const AGENT_REPORT_METRICS = {
  cardLoads: {
    label: 'Card loads',
    unit: 'events',
    kind: 'count',
    help: 'How many times the agent loaded on a page (reach).',
    compute: t => t.cardLoads,
  },
  cardViews: {
    label: 'Card views',
    unit: 'events',
    kind: 'count',
    help: 'How many times the agent was seen in the viewport. Side-panel agents undercount views.',
    compute: t => t.cardViews,
  },
  engagedVisitors: {
    label: 'Engaged visitors',
    unit: 'people',
    kind: 'count',
    help: 'Unique visitors who engaged at least once. Quote this, not engagement events.',
    compute: t => t.engagedVisitors,
  },
  engagementEvents: {
    label: 'Engagement events',
    unit: 'events',
    kind: 'count',
    help: 'Total engagements; one visitor can engage many times.',
    compute: t => t.engagementTakes,
  },
  engagementRate: {
    label: 'Engagement rate',
    unit: '%',
    kind: 'rate',
    maxPlausible: 1,
    help: 'Engagement events ÷ card views.',
    compute: t => safeRatio(t.engagementTakes, t.cardViews),
  },
  questionsAsked: {
    label: 'Questions asked',
    unit: 'events',
    kind: 'count',
    help: 'Questions visitors asked the knowledge agent.',
    compute: t => t.ragCount,
  },
  answeredPct: {
    label: 'Answered',
    unit: '%',
    kind: 'rate',
    maxPlausible: 1,
    help: '(Answers with reference + answers without reference) ÷ questions asked.',
    compute: t => safeRatio((t.ragsWithReference || 0) + (t.ragsWithoutReference || 0), t.ragCount),
  },
  responsesCollected: {
    label: 'Responses collected',
    unit: 'events',
    kind: 'count',
    help: 'Poll / form submissions (action takes).',
    compute: t => t.actionTakes,
  },
  actionsCompleted: {
    label: 'Actions completed',
    unit: 'events',
    kind: 'count',
    help: 'Actions taken by visitors (action takes).',
    compute: t => t.actionTakes,
  },
  leadsWithEmails: {
    label: 'Leads with emails',
    unit: 'people',
    kind: 'count',
    help: 'Leads that included an email address (Agent Summary).',
    compute: t => t.leadsWithEmails,
  },
  avgTimeWithVsWithout: {
    label: 'Avg time: engaged vs not engaged',
    unit: 'time',
    kind: 'timePair',
    sampleSensitive: true,
    help: 'Average time on page for visitors who engaged vs those who did not.',
    compute: t => ({
      primary: t.avgTimeWithEngagement,
      secondary: t.avgTimeWithoutEngagement,
    }),
  },
  avgTimeWithEngagement: {
    label: 'Avg time with engagement',
    unit: 'time',
    kind: 'time',
    sampleSensitive: true,
    help: 'Average time on page for visitors who engaged.',
    compute: t => t.avgTimeWithEngagement,
  },
  engagedCameBack: {
    label: 'Engaged & came back',
    unit: 'people',
    kind: 'count',
    sampleSensitive: true,
    help: 'Visitors who engaged and returned later.',
    compute: t => t.engagedCameBack,
  },
  engagedCameBackEngagedAgain: {
    label: 'Engaged, came back & engaged again',
    unit: 'people',
    kind: 'count',
    sampleSensitive: true,
    help: 'Visitors who engaged, returned and engaged again.',
    compute: t => t.engagedCameBackEngagedAgain,
  },
  uniqueVisitors: {
    label: 'Unique visitors',
    unit: 'people',
    kind: 'count',
    help: 'Unique visitors who saw the agent.',
    compute: t => t.uniqueVisitors,
  },
};

// One entry per agent type. `kpis` drive the summary tiles, `tableMetrics` the per-agent table.
// `hiddenSheetsWhenEmpty` tabs are only shown when the sheet actually has rows.
export const AGENT_REPORT_TYPES = {
  knowledge: {
    label: 'Knowledge',
    description: 'Knowledge (RAG) agents that answer visitor questions.',
    // 'Agent Type' values in the data that default the view to this type.
    dataTypes: ['rag'],
    kpis: [
      'cardLoads',
      'cardViews',
      'engagedVisitors',
      'engagementEvents',
      'engagementRate',
      'questionsAsked',
      'answeredPct',
      'avgTimeWithVsWithout',
    ],
    tableMetrics: [
      'cardLoads',
      'cardViews',
      'engagedVisitors',
      'engagementEvents',
      'engagementRate',
      'questionsAsked',
      'answeredPct',
      'engagedCameBack',
    ],
    hiddenSheetsWhenEmpty: [],
  },
  polling: {
    label: 'Polling (lead capture)',
    description: 'Polling and lead-capture agents.',
    dataTypes: ['pollingAgent'],
    kpis: [
      'cardLoads',
      'engagedVisitors',
      'engagementRate',
      'responsesCollected',
      'leadsWithEmails',
      'avgTimeWithVsWithout',
    ],
    tableMetrics: [
      'cardLoads',
      'engagedVisitors',
      'engagementRate',
      'responsesCollected',
      'leadsWithEmails',
      'engagedCameBack',
    ],
    hiddenSheetsWhenEmpty: QUESTION_SHEETS,
  },
  personalization: {
    label: 'Personalization',
    description: 'Personalization agents. Engagement rate and CTR are not meaningful here.',
    // Personalization agents are 'rag' campaigns in the data, so this type is only ever chosen
    // manually; a manual choice is kept when the data says 'rag'.
    dataTypes: [],
    compatibleDataTypes: ['rag'],
    kpis: ['cardLoads', 'cardViews', 'actionsCompleted', 'avgTimeWithEngagement'],
    tableMetrics: ['cardLoads', 'cardViews', 'actionsCompleted', 'avgTimeWithEngagement'],
    hiddenSheetsWhenEmpty: QUESTION_SHEETS,
  },
};

export const DEFAULT_AGENT_REPORT_TYPE = 'knowledge';

// Picks the report type implied by the data. Returns null when agents have mixed types, when
// the type is unknown, or when the current manual choice is compatible with the data
// (e.g. Personalization agents are 'rag' campaigns, so a manual Personalization choice is kept).
export const detectAgentReportType = (dataTypes, currentType) => {
  const uniqueTypes = [...new Set(dataTypes.map(type => type || ''))];
  if (uniqueTypes.length !== 1) return null;
  const [dataType] = uniqueTypes;
  if (AGENT_REPORT_TYPES[currentType]?.compatibleDataTypes?.includes(dataType)) return null;
  const match = Object.entries(AGENT_REPORT_TYPES).find(([, config]) =>
    config.dataTypes.includes(dataType)
  );
  return match ? match[0] : null;
};

export const AGENT_REPORT_TYPE_OPTIONS = Object.entries(AGENT_REPORT_TYPES).map(
  ([value, { label }]) => ({ value, label })
);
