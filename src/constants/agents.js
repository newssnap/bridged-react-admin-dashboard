// CampaignType (Customer Facing Agents)
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

// AIAgentTypes (Productivity Agents)
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

// Options for UI components (Checkbox.Group, Select, etc.)
export const CAMPAIGN_OPTIONS = [
  // { label: 'Recirculation Agent', value: CampaignType.Recirculation },
  { label: 'Pooling Agent', value: CampaignType.PoolingAgent },
  { label: 'Smart Reading Agent', value: CampaignType.XRay },
  { label: 'Knowledge Agent', value: CampaignType.Rag },
  { label: 'Email Collection Agent', value: CampaignType.EmailCollection },
];

export const MONETIZE_PACK_OPTIONS = [
  { label: 'Smart Offerwal Agent', value: CampaignType.AffiliateLink },
];

export const AI_AGENT_OPTIONS = [
  { label: 'Rule Checker Agent', value: AIAgentTypes.RuleChecker },
  { label: 'Drafter Agent', value: AIAgentTypes.ResearchPartner },
  { label: 'SEO Agent', value: AIAgentTypes.ProSEOOptimizer },
  { label: 'Data Explorer Agent', value: AIAgentTypes.DEA },
];
