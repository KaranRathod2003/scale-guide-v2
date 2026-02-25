interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  fetchPromise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttlMs: number }
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.data;
  }

  if (existing?.fetchPromise) {
    return existing.fetchPromise;
  }

  const fetchPromise = fetcher();

  if (existing) {
    existing.fetchPromise = fetchPromise;
  }

  try {
    const data = await fetchPromise;
    cache.set(key, { data, expiresAt: now + options.ttlMs });
    return data;
  } catch (err) {
    if (existing) {
      cache.set(key, { data: existing.data, expiresAt: now + options.ttlMs / 2 });
      return existing.data;
    }
    throw err;
  }
}
