import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as announcementService from '../services/announcementService.js';
import { readFile, stat } from 'node:fs/promises';

const announcementRouter = new Hono();

announcementRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  console.log(`Streaming audio for id=${id}`);
  // const audioData = await announcementService.getAudio(id);

  let filePath = '/tmp/audio.wav';
  if (id === 'audio.mp3') {
    filePath = '/tmp/audio.mp3';
  }
  const audioData = await readFile(filePath);

  return new Response(new Uint8Array(audioData), {
    headers: {
      'Content-Type': id === 'audio.mp3' ? 'audio/mpeg' : 'audio/wav',
      'Content-Length': audioData.length.toString(),
    },
  });
});

announcementRouter.post('/audio', async (c) => {
  const arrayBuffer = await c.req.arrayBuffer();
  await announcementService.announceAudio(arrayBuffer);

  return c.json(
    {
      message: 'ok',
    },
    201
  );
});

announcementRouter.post(
  '/',
  zValidator(
    'json',
    z.object({
      text: z.string(),
    })
  ),
  async (c) => {
    const { text } = c.req.valid('json');

    // text-to-speech (didn't like the standard voices, giving up for now)

    return c.json(
      {
        message: text,
      },
      201
    );
  }
);

export default announcementRouter;
