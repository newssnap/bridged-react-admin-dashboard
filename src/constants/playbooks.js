import {
  AimOutlined,
  CustomerServiceOutlined,
  FundOutlined,
  LineChartOutlined,
  RiseOutlined,
  StarOutlined,
} from '@ant-design/icons';

/**
 * Optional per-playbook agent description overrides.
 * Keys are agent values (e.g. 'rag', 'pollingAgent'); values are playbook-specific descriptions.
 * Omit or use empty object to fall back to totalAgentTypes descriptions.
 * @typedef {{ [agentValue: string]: string }} AgentDescriptions
 */

export const PlaybookType = {
  ACTIVATION: {
    value: 'activation',
    title: 'Activation',
    icon: AimOutlined,
    shortDescription:
      'Identify, prioritise, and activate the audiences and sponsors most likely to engage.',
    longDescription:
      'Helps event teams move beyond broad outreach by identifying high-propensity audiences, re-activating dormant contacts, and capturing early intent signals. Engagement becomes targeted, measurable, and aligned to real interest before conversion begins.',
    agentTypes: ['rag', 'pollingAgent', 'qualification'],
    agentDescriptions: {
      rag: 'Guides visitors through event content, answers key questions, and captures early engagement signals to identify high-intent audiences.',
      pollingAgent:
        'Collects preference and interest signals through lightweight interactions to refine targeting and activation priority.',
      qualification:
        'Scores engagement and identifies which audiences or sponsors should be prioritised for follow-up or conversion.',
    },
  },

  NURTURE_CONVERSION: {
    value: 'nurture_conversion',
    title: 'Nurture & Conversion',
    icon: RiseOutlined,
    shortDescription: 'Guide interested visitors toward registrations, bookings, or submissions.',
    longDescription:
      'Supports prospects during the evaluation phase by responding to questions, surfacing relevant sessions or sponsors, and guiding each user toward their most relevant next step. Converts passive interest into measurable actions through contextual, conversational progression.',
    agentTypes: ['rag', 'pollingAgent', 'recirculation', 'qualification'],
    agentDescriptions: {
      rag: 'Provides contextual answers and guidance while helping visitors explore sessions, sponsors, and event options.',
      pollingAgent:
        'Captures preferences and buying signals to understand what matters most to each visitor during their decision process.',
      recirculation:
        'Surfaces relevant next steps such as sessions, sponsors, upgrades, or actions that match the visitor’s intent.',
      qualification:
        'Identifies readiness to convert and highlights high-value prospects for targeted routing or follow-up.',
    },
  },

  HYPER_PERSONALISED_JOURNEY: {
    value: 'hyper_personalised_event_journey',
    title: 'Hyper-Personalised Event Journey',
    icon: StarOutlined,
    shortDescription:
      'Deliver tailored event guidance, recommendations, and discovery experiences.',
    longDescription:
      'Creates a continuously personalised event experience by adapting recommendations, answers, and discovery paths based on attendee behaviour and priorities. Helps participants find the most relevant sessions, sponsors, and opportunities with minimal friction.',
    agentTypes: ['rag', 'pollingAgent', 'recirculation'],
    agentDescriptions: {
      rag: 'Acts as a personalised concierge, helping attendees discover relevant sessions, content, and information in real time.',
      pollingAgent:
        'Learns attendee interests and priorities to continuously refine recommendations and experience relevance.',
      recirculation:
        'Dynamically recommends sessions, sponsors, or networking opportunities aligned with each attendee’s profile.',
    },
  },

  SPONSOR_MAXIMISATION: {
    value: 'sponsor_maximisation',
    title: 'Sponsor Maximisation',
    icon: FundOutlined,
    shortDescription:
      'Connect buyer intent with the right sponsors and produce measurable ROI signals.',
    longDescription:
      'Transforms sponsorship from passive exposure into measurable engagement by routing qualified attendees to relevant sponsors, capturing interaction signals, and supporting sponsor conversations at the right moment. Strengthens reporting, renewal confidence, and commercial value.',
    agentTypes: ['rag', 'pollingAgent', 'qualification'],
    agentDescriptions: {
      rag: 'Acts as a sponsor navigator, helping attendees discover relevant vendors, solutions, and sponsor content.',
      pollingAgent:
        'Captures buyer needs and interest signals that help match attendees with the most relevant sponsors.',
      qualification:
        'Identifies commercially valuable prospects and supports routing toward sponsor meetings or conversations.',
    },
  },

  OPS_DEFLECTION: {
    value: 'ops_deflection',
    title: 'Ops Deflection',
    icon: CustomerServiceOutlined,
    shortDescription: 'Automatically resolve repeat queries and reduce operational support load.',
    longDescription:
      'Handles high-volume attendee, sponsor, and exhibitor queries by providing instant, accurate answers from event knowledge sources. Reduces inbox pressure, prevents repetitive support work, and allows teams to focus only on complex or high-priority issues.',
    agentTypes: ['rag'],
    agentDescriptions: {
      rag: 'Answers operational questions instantly using event knowledge, helping users resolve issues without contacting support.',
    },
  },

  DATA_DECISION_INTELLIGENCE: {
    value: 'data_decision_intelligence',
    title: 'Data-Driven Decision Intelligence',
    icon: LineChartOutlined,
    shortDescription: 'Turn event and audience data into actionable portfolio insights.',
    longDescription:
      'Aggregates interaction, engagement, and performance data across events to reveal patterns, benchmark outcomes, and support better commercial and operational decisions. Helps teams understand what drives revenue, engagement, and sponsor success over time.',
    agentTypes: ['DEA'],
    agentDescriptions: {
      DEA: 'Explores cross-event data, highlights performance patterns, and surfaces insights that support planning, pricing, and strategy decisions.',
    },
  },
};

export const agentTypesForPlaybooks = [
  { label: 'Smart Reading Agent', value: 'xRay' },
  { label: 'Polling Agent', value: 'pollingAgent' },
  { label: 'Email Collection Agent', value: 'emailCollection' },
  { label: 'Knowledge Agent', value: 'rag' },
  { label: 'Smart Offerwall Agent', value: 'recirculation' },
  { label: 'Qualification Agent', value: 'qualification' },
];
