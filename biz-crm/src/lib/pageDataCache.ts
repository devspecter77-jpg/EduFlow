/**
 * Tiny in-memory cache so pages can render their last-fetched data
 * instantly when the user navigates back to them, instead of showing a
 * loading skeleton every single time — the loader stays reserved for the
 * very first visit in a session, when there is genuinely nothing to show
 * yet. Cleared on full page reload (it's just a module-level Map).
 */
const cache = new Map<string, unknown>();

export function getPageCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setPageCache<T>(key: string, value: T): void {
  cache.set(key, value);
}
