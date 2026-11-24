import type { Context } from 'hono';
import type { AppEnvironment } from './types';

export const PORTFOLIO_CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

function defaultCache(): Cache | undefined {
  try {
    if (typeof caches === 'undefined') return undefined;
    return (caches as CacheStorage & { default: Cache }).default;
  } catch {
    return undefined;
  }
}

function portfolioKey(url: string): Request {
  const key = new URL('/api/portfolio', url);
  return new Request(key.toString(), { method: 'GET' });
}

export async function getCachedPortfolio(c: Context<AppEnvironment>): Promise<Response | undefined> {
  const cache = defaultCache();
  if (!cache) return undefined;
  try {
    return await cache.match(portfolioKey(c.req.url));
  } catch {
    return undefined;
  }
}

export async function cachePortfolioResponse(c: Context<AppEnvironment>, response: Response): Promise<void> {
  const cache = defaultCache();
  if (!cache) return;
  try {
    const put = cache.put(portfolioKey(c.req.url), response.clone());
    if (c.executionCtx) c.executionCtx.waitUntil(put);
    else await put;
  } catch {
    // Cache API is an optimization only; a cache failure must not affect the public response.
  }
}

export async function invalidatePortfolioCache(c: Context<AppEnvironment>): Promise<void> {
  const cache = defaultCache();
  if (!cache) return;
  try {
    const deletion = cache.delete(portfolioKey(c.req.url));
    if (c.executionCtx) c.executionCtx.waitUntil(deletion);
    else await deletion;
  } catch {
    // Local Node development does not expose caches.default.
  }
}
