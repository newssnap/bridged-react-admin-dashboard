/**
 * Parse a Claude/OAuth authorize redirect URL into the approve payload.
 * Returns null when the value is missing or not a real OAuth authorize URL.
 */
export function parseOAuthAuthorizePayload(oauthRedirect) {
  if (!oauthRedirect || typeof oauthRedirect !== 'string') {
    return null;
  }

  try {
    const oauthUrl = new URL(oauthRedirect);
    const oauthParams = oauthUrl.searchParams;
    const payload = {
      response_type: oauthParams.get('response_type'),
      client_id: oauthParams.get('client_id'),
      redirect_uri: oauthParams.get('redirect_uri'),
      scope: (oauthParams.get('scope') || '').replace(/\+/g, ' ').trim(),
      state: oauthParams.get('state'),
      code_challenge: oauthParams.get('code_challenge'),
      code_challenge_method: oauthParams.get('code_challenge_method'),
      resource: oauthParams.get('resource'),
    };

    const hasRequiredParams = Object.values(payload).every(Boolean);
    return hasRequiredParams ? payload : null;
  } catch (error) {
    return null;
  }
}

export function isValidOAuthRedirect(oauthRedirect) {
  return Boolean(parseOAuthAuthorizePayload(oauthRedirect));
}

export function getValidOAuthRedirectFromSearch(search = '') {
  const searchParams = new URLSearchParams(
    typeof search === 'string' ? search.replace(/^\?/, '') : ''
  );
  const oauthRedirect = searchParams.get('oauth_redirect');
  return isValidOAuthRedirect(oauthRedirect) ? oauthRedirect : null;
}

/** Build `/login` and only append oauth_redirect for a real Claude OAuth URL. */
export function buildLoginPath(search = '') {
  const oauthRedirect = getValidOAuthRedirectFromSearch(search);
  if (!oauthRedirect) {
    return '/login';
  }
  return `/login?oauth_redirect=${encodeURIComponent(oauthRedirect)}`;
}
