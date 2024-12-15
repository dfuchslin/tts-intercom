import { writeFile } from 'node:fs/promises';
import { spawn } from 'child_process';
import * as espService from './espService.js';
import * as sonosService from './sonosService.js';

export type Announcement = {
  url: string;
};

export const announceAudio = async (arrayBuffer: ArrayBuffer) => {
  const buffer = Buffer.from(arrayBuffer);

  const announcement = await createAnnouncement(buffer);
  await broadcastAnnouncement(announcement);
};

const createAnnouncement = async (buffer: Buffer<ArrayBufferLike>): Promise<Announcement> => {
  const filepath = 'audio.m4a';
  await writeFile(filepath, buffer);
  await convertToWav(filepath, 'audio.wav');

  console.log({ filepath, length: buffer.length });
  return { url: 'http://192.168.1.123:3000/api/announce/audio.wav' };
  // return { url: 'http://192.168.1.123:8000/audio.wav' };
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
    const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', ['-y', '-i', inputPath, outputPath]);

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
