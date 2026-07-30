import {
  buildLoginPath,
  getValidOAuthRedirectFromSearch,
  parseOAuthAuthorizePayload,
} from './oauthRedirect';

const validOAuthRedirect =
  'https://claude.ai/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&scope=read+write&state=test-state&code_challenge=test-challenge&code_challenge_method=S256&resource=https%3A%2F%2Fapi.anthropic.com';

describe('oauthRedirect helpers', () => {
  test('parseOAuthAuthorizePayload returns all required OAuth params including resource', () => {
    expect(parseOAuthAuthorizePayload(validOAuthRedirect)).toEqual({
      response_type: 'code',
      client_id: 'test-client',
      redirect_uri: 'https://app.example.com/callback',
      scope: 'read write',
      state: 'test-state',
      code_challenge: 'test-challenge',
      code_challenge_method: 'S256',
      resource: 'https://api.anthropic.com',
    });
  });

  test('parseOAuthAuthorizePayload returns null when resource is missing', () => {
    const oauthRedirectWithoutResource =
      'https://claude.ai/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&scope=read+write&state=test-state&code_challenge=test-challenge&code_challenge_method=S256';

    expect(parseOAuthAuthorizePayload(oauthRedirectWithoutResource)).toBeNull();
  });

  test('getValidOAuthRedirectFromSearch only returns a fully valid OAuth redirect', () => {
    expect(
      getValidOAuthRedirectFromSearch(
        `?oauth_redirect=${encodeURIComponent(validOAuthRedirect)}`
      )
    ).toBe(validOAuthRedirect);

    expect(
      getValidOAuthRedirectFromSearch(
        '?oauth_redirect=https%3A%2F%2Fclaude.ai%2Foauth%2Fauthorize%3Fclient_id%3Dmissing-fields'
      )
    ).toBeNull();
  });

  test('buildLoginPath preserves only valid OAuth redirect values', () => {
    expect(buildLoginPath(`?oauth_redirect=${encodeURIComponent(validOAuthRedirect)}`)).toBe(
      `/login?oauth_redirect=${encodeURIComponent(validOAuthRedirect)}`
    );

    expect(buildLoginPath('?oauth_redirect=invalid')).toBe('/login');
  });
});
