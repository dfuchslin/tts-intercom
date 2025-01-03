import { writeFile } from 'node:fs/promises';
import { spawn } from 'child_process';
import * as espService from './hassService.js';
import * as sonosService from './sonosService.js';
import { config } from '../config.js';

export type Announcement = {
  url: string;
};

export const announceAudio = async (arrayBuffer: ArrayBuffer) => {
  const buffer = Buffer.from(arrayBuffer);

  const announcement = await createAnnouncement(buffer);
  await broadcastAnnouncement(announcement);
};

const createAnnouncement = async (buffer: Buffer<ArrayBufferLike>): Promise<Announcement> => {
  const filepath = '/tmp/audio.m4a';
  await writeFile(filepath, buffer);
  await convertToWav(filepath, '/tmp/audio.wav');

  console.log({ filepath, length: buffer.length });
  return { url: `${config.SERVER_ENDPOINT}/api/announce/audio.wav` };
};

const broadcastAnnouncement = async (announcement: Announcement) => {
  const broadcasts: Promise<void>[] = [];
  broadcasts.push(...espService.enqueueBroadcast(announcement));
  broadcasts.push(...sonosService.enqueueBroadcast(announcement));
  await Promise.all(broadcasts);
};

const convertToWav = async (inputPath: string, outputPath: string) => {
  console.log(`Converting audio '${inputPath}' to ${outputPath}`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(config.FFMPEG_BIN, [
      '-y',
      '-i',
      inputPath,
      '-acodec',
      'pcm_s16le',
      '-ac',
      '1',
      '-ar',
      '44100',
      outputPath,
    ]);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
  });
};
