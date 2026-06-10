import { API_URL } from '../../config/Config';

export function openUserPortal(accessToken) {
  if (!accessToken) return;

  if (API_URL.includes('stg')) {
    window.open(`https://stg-portal.bridged.media/?accessToken=${accessToken}`, '_blank');
  } else if (API_URL.includes('dev')) {
    window.open(`https://dev-portal.bridged.media/?accessToken=${accessToken}`, '_blank');
  } else {
    window.open(`https://portal.bridged.media/?accessToken=${accessToken}`, '_blank');
  }
}
