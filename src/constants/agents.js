export const AGENT_TYPES = {
  CAMPAIGN: 'Campaign',
  AI_AGENT: 'AiAgent',
  SMART_REPLY_AGENT: 'SmartReplyAgent',
};

export const AUTOMATE_PACK_OPTIONS = [
  { label: 'Drafter Agent', value: 'ResearchPartner', type: AGENT_TYPES.AI_AGENT },
  { label: 'Data Explorer Agent', value: 'DEA', type: AGENT_TYPES.AI_AGENT },
  { label: 'SEO Agent', value: 'ProSEOOptimizer', type: AGENT_TYPES.AI_AGENT },
  { label: 'Rule Checker Agent', value: 'RuleChecker', type: AGENT_TYPES.AI_AGENT },
];

export const ENGAGE_PACK_OPTIONS = [
  { label: 'Email Knowledge Agent', value: 'email', type: AGENT_TYPES.SMART_REPLY_AGENT },
  { label: 'Smart Reading Agent', value: 'xRay', type: AGENT_TYPES.CAMPAIGN },
  { label: 'Polling Agent', value: 'poolingAgent', type: AGENT_TYPES.CAMPAIGN },
  { label: 'Email Collection Agent', value: 'emailCollection', type: AGENT_TYPES.CAMPAIGN },
  { label: 'Knowledge Agent', value: 'rag', type: AGENT_TYPES.CAMPAIGN },
];

export const MONETIZE_PACK_OPTIONS = [
  { label: 'Smart Offerwal Agent', value: 'affiliateLink', type: AGENT_TYPES.CAMPAIGN },
];

export const CampaignType = {
  NewsLetterSignup: 'newsLetterSignup',
  AffiliateLink: 'affiliateLink',
  SurveyAndForm: 'surveyAndForm',
  Registeration: 'registration',
  Recirculation: 'recirculation',
  XRay: 'xRay',
  EngagementOnly: 'engagementOnly',
  Rag: 'rag',
  EmailCollection: 'emailCollection',
  PoolingAgent: 'poolingAgent',
};

export const AIAgentTypes = {
  SEOOptimizer: 'SEOOptimizer',
  AISummaryGenerator: 'AISummaryGenerator',
  Uniqueness: 'Uniqueness',
  RuleChecker: 'RuleChecker',
  Backlink: 'Backlink',
  DiscoveryAgent: 'DiscoveryAgent',
  ResearchPartner: 'ResearchPartner',
  ProSEOOptimizer: 'ProSEOOptimizer',
  DEA: 'DEA',
};

// Legacy options for backward compatibility
export const CAMPAIGN_OPTIONS = ENGAGE_PACK_OPTIONS.filter(
  option => option.type === AGENT_TYPES.CAMPAIGN
);
export const AI_AGENT_OPTIONS = AUTOMATE_PACK_OPTIONS.filter(
  option => option.type === AGENT_TYPES.AI_AGENT
);
