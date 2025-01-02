import { serve } from '@hono/node-server';
import { config } from './config.js';
import { prometheus } from '@hono/prometheus';
import { Hono } from 'hono';
import announcementRouter from './routers/announcementRouter.js';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

const { printMetrics, registerMetrics } = prometheus();

app.use('*', registerMetrics);
app.get('/metrics', printMetrics);

app.get('/health', (c) => {
  return c.json({ ok: true });
});

app.route('/api/announce', announcementRouter);

app.use('*', serveStatic({ root: './public' }));

serve(
  {
    fetch: app.fetch,
    port: config.SERVICE_PORT,
  },
  (info) => {
    console.log(`Listening on port ${info.port}`);
  }
);

process.on('SIGINT', () => {
  console.log('Server shutting down');
  process.exit();
});
