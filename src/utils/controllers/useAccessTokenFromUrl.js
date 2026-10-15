import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * `?accessToken=` signs the admin in with that token, then strips it from the URL and reloads,
 * so the token never stays in the address bar or history.
 */
export default function useAccessTokenFromUrl() {
  const { search, pathname } = useLocation();
  const queryAccessToken = new URLSearchParams(search).get('accessToken');

  useEffect(() => {
    if (queryAccessToken) {
      localStorage.setItem('accessToken', queryAccessToken);
      const params = new URLSearchParams(search);
      params.delete('accessToken');
      const rest = params.toString();
      window.history.replaceState({}, document.title, rest ? `${pathname}?${rest}` : pathname);
      window.location.reload();
    }
  }, [queryAccessToken, search, pathname]);
}
