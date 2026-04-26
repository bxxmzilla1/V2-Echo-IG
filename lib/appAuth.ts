/**
 * Client-side session gate (not for security). Public profile routes /:slug stay open for shared links.
 */
const APP_ACCESS_PASSWORD = 'heavenzy1997@gmail.com';

const AUTH_STORAGE_KEY = 'echo-ig-app-auth';

export function verifyAppPassword(attempt: string): boolean {
  return attempt === APP_ACCESS_PASSWORD;
}

export function isAppUnlocked(): boolean {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAppUnlocked(): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function pathRequiresAppAuth(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p === '/' || p === '/published';
}
