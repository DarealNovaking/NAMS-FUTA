const BASE_URL = import.meta.env.BASE_URL || '/';
const BASE_PATH = BASE_URL === '/' ? '' : BASE_URL.replace(/\/$/, '');

export function siteHref(pathname = '/') {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return BASE_PATH ? `${BASE_PATH}${normalized === '/' ? '/' : normalized}` : normalized;
}
