import { writeFile } from 'node:fs/promises';
import { spawn } from 'child_process';
import * as espService from './hassService.js';
import { config } from '../config.js';
import * as path from 'node:path';

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
  await convertToMp3(filepath, '/tmp/audio.mp3');

  console.log({ filepath, length: buffer.length });
  return {
    url: `${config.SERVER_ENDPOINT}/api/announce/audio.wav`,
  };
};

const broadcastAnnouncement = async (announcement: Announcement) => {
  const broadcasts: Promise<void>[] = [];
  broadcasts.push(...espService.enqueueBroadcast(announcement));
  await Promise.all(broadcasts);
};

const convertToWav = async (inputPath: string, outputPath: string) => {
  const announcementChimePath = getAnnouncementChimePath();
  console.log(`Converting and concatening audio '${announcementChimePath}', '${inputPath}' to ${outputPath}`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(config.FFMPEG_BIN, [
      '-y',
      '-i',
      announcementChimePath,
      '-i',
      inputPath,
      '-filter_complex',
      'concat=n=2:v=0:a=1',
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

const convertToMp3 = async (inputPath: string, outputPath: string) => {
  const announcementChimePath = getAnnouncementChimePath();
  console.log(`Converting and concatening audio '${announcementChimePath}', '${inputPath}' to ${outputPath}`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(config.FFMPEG_BIN, [
      '-y',
      '-i',
      announcementChimePath,
      '-i',
      inputPath,
      '-filter_complex',
      'concat=n=2:v=0:a=1',
      '-acodec',
      'libmp3lame',
      '-q:a',
      '0',
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

const getAnnouncementChimePath = () => {
  return path.join(process.cwd(), 'public', 'static', 'sbb-1chan-44100.wav');
};
