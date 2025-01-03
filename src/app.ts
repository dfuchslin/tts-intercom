import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { prometheus } from '@hono/prometheus';
import { Hono } from 'hono';
import announcementRouter from './routers/announcementRouter.js';
import { config } from './config.js';
import staticFileRouter from './routers/staticFileRouter.js';


const app = new Hono();

const { printMetrics, registerMetrics } = prometheus();

app.use(logger());
app.use('*', registerMetrics);
app.get('/metrics', printMetrics);

app.get('/health', (c) => {
  return c.json({ ok: true });
});

app.route('/api/announce', announcementRouter);
app.route('*', staticFileRouter);

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
