import { Hono } from 'hono';
import { inquirySchema } from '../../shared/schemas';
import type { SponsorInquiry } from '../../shared/types';
import { getRepository } from '../../db/repository';
import { cachePortfolioResponse, getCachedPortfolio, PORTFOLIO_CACHE_CONTROL } from '../cache';
import type { AppEnvironment } from '../types';

const publicRoutes = new Hono<AppEnvironment>();
const RATE_LIMIT_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const inquiryAttempts = new Map<string, number[]>();

function clientKey(request: Request): string {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (inquiryAttempts.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    inquiryAttempts.set(key, recent);
    return true;
  }
  recent.push(now);
  inquiryAttempts.set(key, recent);
  if (inquiryAttempts.size > 1000) {
    for (const [candidate, timestamps] of inquiryAttempts) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_MS)) inquiryAttempts.delete(candidate);
    }
  }
  return false;
}

publicRoutes.get('/portfolio', async (c) => {
  const cached = await getCachedPortfolio(c);
  if (cached) return cached;

  const repository = getRepository(c.env);
  const [profile, clips, loadouts, packages] = await Promise.all([
    repository.getProfile(),
    repository.listClips(),
    repository.listLoadouts(),
    repository.listPackages(),
  ]);
  const response = c.json({
    profile,
    clips,
    loadouts,
    packages,
    meta: { storage: repository.mode, demoMode: repository.mode === 'memory' },
  }, 200, { 'Cache-Control': PORTFOLIO_CACHE_CONTROL });
  await cachePortfolioResponse(c, response);
  return response;
});

publicRoutes.post('/inquiries', async (c) => {
  if (isRateLimited(clientKey(c.req.raw))) {
    return c.json({ error: 'Too many requests. Please try again in a few minutes.' }, 429);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (body && typeof body === 'object' && 'website' in body && String((body as { website?: unknown }).website ?? '').trim()) {
    // Silent honeypot success: do not reveal the field to automated form submitters.
    return c.json({ ok: true });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Please review the form fields.', issues: parsed.error.flatten().fieldErrors }, 400);
  }
  const { website: _website, ...input } = parsed.data;
  try {
    const inquiry = await getRepository(c.env).createInquiry(input as Omit<SponsorInquiry, 'id' | 'status' | 'createdAt'>);
    return c.json({ ok: true, inquiry: { id: inquiry.id, status: inquiry.status } }, 201);
  } catch {
    return c.json({ error: 'The inquiry could not be saved. Please contact Red directly.' }, 503);
  }
});

export default publicRoutes;
