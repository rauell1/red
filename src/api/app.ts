import { Hono } from 'hono';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import type { AppEnvironment } from './types';

export const app = new Hono<AppEnvironment>();

app.get('/api/health', (c) => c.json({ ok: true, service: 'red-portfolio-api' }));
app.route('/api', publicRoutes);
app.route('/api/admin', adminRoutes);

app.notFound((c) => c.json({ error: 'Not found.' }, 404));
app.onError((error, c) => {
  console.error('[red-api]', error);
  return c.json({ error: 'The request could not be completed.' }, 500);
});
