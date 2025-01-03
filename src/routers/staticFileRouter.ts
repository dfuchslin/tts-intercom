import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';

const staticFileRouter = new Hono();

// hack to set response mime-type as `serveStatic` doesn't yet expose an easy way to override this
staticFileRouter.use('*', async (c, next) => {
  await next();
  const path = c.req.path;

  if (path.endsWith('.wav')) {
    c.header('Content-Type', 'audio/x-wav');
  } else if (path.endsWith('.mp3')) {
    c.header('Content-Type', 'audio/mpeg');
  }
});

staticFileRouter.use(
  '*',
  serveStatic({
    root: './public',
  })
);

export default staticFileRouter;
