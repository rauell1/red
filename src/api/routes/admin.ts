import { Hono, type Context } from 'hono';
import { z } from 'zod';
import {
  clipSchema,
  inquiryStatusSchema,
  loadoutSchema,
  loginSchema,
  packageSchema,
  profileSchema,
} from '../../shared/schemas';
import { getRepository } from '../../db/repository';
import { invalidatePortfolioCache } from '../cache';
import {
  clearSessionCookie,
  expectedAdminPassword,
  isAuthenticated,
  isPreviewMode,
  setSessionCookie,
} from '../auth';
import type { AppEnvironment } from '../types';

const adminRoutes = new Hono<AppEnvironment>();
const idSchema = z.coerce.number().int().positive();

async function readJson(c: Context<AppEnvironment>): Promise<unknown> {
  try { return await c.req.json(); } catch { return undefined; }
}

function issueResponse(c: Context<AppEnvironment>, error: z.ZodError) {
  return c.json({ error: 'Please review the submitted fields.', issues: error.flatten().fieldErrors }, 400);
}

adminRoutes.post('/login', async (c) => {
  const body = await readJson(c);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return issueResponse(c, parsed.error);
  if (parsed.data.password !== expectedAdminPassword(c.env)) {
    return c.json({ error: 'Incorrect password.' }, 401);
  }
  await setSessionCookie(c);
  return c.json({ ok: true, demoMode: isPreviewMode(c.env) });
});

adminRoutes.post('/logout', (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});

adminRoutes.get('/session', async (c) => {
  const repository = getRepository(c.env);
  const authenticated = await isAuthenticated(c);
  return c.json({
    authenticated,
    demoMode: isPreviewMode(c.env),
    storage: repository.mode,
  });
});

adminRoutes.use('*', async (c, next) => {
  if (!await isAuthenticated(c)) return c.json({ error: 'Sign in to continue.' }, 401);
  await next();
});

adminRoutes.get('/data', async (c) => {
  const repository = getRepository(c.env);
  const [profile, clips, loadouts, packages, inquiries] = await Promise.all([
    repository.getProfile(),
    repository.listClips(),
    repository.listLoadouts(),
    repository.listPackages(),
    repository.listInquiries(),
  ]);
  return c.json({ profile, clips, loadouts, packages, inquiries, meta: { storage: repository.mode, demoMode: repository.mode === 'memory' } });
});

adminRoutes.put('/profile', async (c) => {
  const parsed = profileSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  const profile = await getRepository(c.env).updateProfile(parsed.data);
  await invalidatePortfolioCache(c);
  return c.json({ profile });
});

adminRoutes.post('/clips', async (c) => {
  const parsed = clipSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  const clip = await getRepository(c.env).saveClip(parsed.data);
  await invalidatePortfolioCache(c);
  return c.json({ clip }, 201);
});

adminRoutes.put('/clips/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid clip id.' }, 400);
  const parsed = clipSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  try {
    const clip = await getRepository(c.env).saveClip(parsed.data, id.data);
    await invalidatePortfolioCache(c);
    return c.json({ clip });
  } catch {
    return c.json({ error: 'Clip not found.' }, 404);
  }
});

adminRoutes.delete('/clips/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid clip id.' }, 400);
  const deleted = await getRepository(c.env).deleteClip(id.data);
  if (!deleted) return c.json({ error: 'Clip not found.' }, 404);
  await invalidatePortfolioCache(c);
  return c.json({ ok: true });
});

adminRoutes.post('/loadouts', async (c) => {
  const parsed = loadoutSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  const loadout = await getRepository(c.env).saveLoadout(parsed.data);
  await invalidatePortfolioCache(c);
  return c.json({ loadout }, 201);
});

adminRoutes.put('/loadouts/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid loadout id.' }, 400);
  const parsed = loadoutSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  try {
    const loadout = await getRepository(c.env).saveLoadout(parsed.data, id.data);
    await invalidatePortfolioCache(c);
    return c.json({ loadout });
  } catch {
    return c.json({ error: 'Loadout not found.' }, 404);
  }
});

adminRoutes.delete('/loadouts/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid loadout id.' }, 400);
  const deleted = await getRepository(c.env).deleteLoadout(id.data);
  if (!deleted) return c.json({ error: 'Loadout not found.' }, 404);
  await invalidatePortfolioCache(c);
  return c.json({ ok: true });
});

adminRoutes.post('/packages', async (c) => {
  const parsed = packageSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  const item = await getRepository(c.env).savePackage(parsed.data);
  await invalidatePortfolioCache(c);
  return c.json({ package: item }, 201);
});

adminRoutes.put('/packages/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid package id.' }, 400);
  const parsed = packageSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  try {
    const item = await getRepository(c.env).savePackage(parsed.data, id.data);
    await invalidatePortfolioCache(c);
    return c.json({ package: item });
  } catch {
    return c.json({ error: 'Package not found.' }, 404);
  }
});

adminRoutes.delete('/packages/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid package id.' }, 400);
  const deleted = await getRepository(c.env).deletePackage(id.data);
  if (!deleted) return c.json({ error: 'Package not found.' }, 404);
  await invalidatePortfolioCache(c);
  return c.json({ ok: true });
});

adminRoutes.patch('/inquiries/:id', async (c) => {
  const id = idSchema.safeParse(c.req.param('id'));
  if (!id.success) return c.json({ error: 'Invalid inquiry id.' }, 400);
  const parsed = inquiryStatusSchema.safeParse(await readJson(c));
  if (!parsed.success) return issueResponse(c, parsed.error);
  const inquiry = await getRepository(c.env).setInquiryStatus(id.data, parsed.data.status);
  if (!inquiry) return c.json({ error: 'Inquiry not found.' }, 404);
  await invalidatePortfolioCache(c);
  return c.json({ inquiry });
});

export default adminRoutes;
