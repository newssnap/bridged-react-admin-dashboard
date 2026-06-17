const ENV_CONFIG = {
  dev: {
    API_URL: 'https://dev-gateway.bridged.media',
    FLIPCARD_URL: 'https://dev-agent-card.bridged.media',
    PLUGIN_ID: 'emhhoipfejbinjafgafpfljgpacfaebg',
  },

  staging: {
    API_URL: 'https://stg-gateway.bridged.media',
    FLIPCARD_URL: 'https://stg-agent-card.bridged.media',
    PLUGIN_ID: 'emhhoipfejbinjafgafpfljgpacfaebg',
  },

  production: {
    API_URL: 'https://gateway.bridged.media',
    FLIPCARD_URL: 'https://agent-card.bridged.media',
    PLUGIN_ID: 'emhhoipfejbinjafgafpfljgpacfaebg',
  },
};

const hostname = window.location.hostname;

function getLocalEnvironmentOverride() {
  const params = new URLSearchParams(window.location.search);

  return params.get('env');
}

function resolveEnvironment() {
  // localhost behavior
  if (hostname.includes('localhost')) {
    const localEnv = getLocalEnvironmentOverride();

    if (localEnv && ENV_CONFIG[localEnv]) {
      return ENV_CONFIG[localEnv];
    }

    // default local env
    return ENV_CONFIG.staging;
  }

  // deployed staging
  if (hostname.includes('stg')) {
    return ENV_CONFIG.staging;
  }

  // deployed dev
  if (hostname.includes('dev')) {
    return ENV_CONFIG.dev;
  }

  // production fallback
  return ENV_CONFIG.production;
}

const currentEnv = resolveEnvironment();

export const { API_URL, FLIPCARD_URL, PLUGIN_ID } = currentEnv;
