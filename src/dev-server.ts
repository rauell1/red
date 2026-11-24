import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { app as apiApp } from './api/app';
import type { AppBindings } from './api/types';

const port = Number(process.env.PORT) || 3000;
const environment: AppBindings = {
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

const server = new Hono();
server.all('/api/*', (c) => apiApp.fetch(c.req.raw, environment));

if (process.env.NODE_ENV === 'production') {
  server.use('*', serveStatic({
    root: './dist/client',
    rewriteRequestPath: (path) => {
      const finalSegment = path.split('/').at(-1) ?? '';
      return path === '/' || !finalSegment.includes('.') ? '/index.html' : path;
    },
  }));
}

server.notFound((c) => c.json({ error: 'Not found.' }, 404));

serve({
  fetch: server.fetch,
  port,
  hostname: '0.0.0.0',
}, (info) => {
  console.log(`RED API ${process.env.NODE_ENV === 'production' ? 'production preview' : 'development'} listening on http://0.0.0.0:${info.port}`);
});
