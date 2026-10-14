import { API_URL } from '../../config/Config';

export function openUserPortal(accessToken, refreshToken) {
  if (!accessToken) return;

  const params = new URLSearchParams({ accessToken });
  if (refreshToken) {
    params.set('refreshToken', refreshToken);
  }
  const query = params.toString();

  if (API_URL.includes('stg')) {
    window.open(`https://stg-portal.bridged.media/?${query}`, '_blank');
  } else if (API_URL.includes('dev')) {
    window.open(`https://dev-portal.bridged.media/?${query}`, '_blank');
  } else {
    window.open(`https://portal.bridged.media/?${query}`, '_blank');
  }
}
