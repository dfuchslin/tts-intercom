import dotenv from 'dotenv';
import { z } from 'zod';

const configSchema = z.object({
  SERVICE_PORT: z.coerce.number().default(3000),

  TEMP_DIR: z.string().default('/tmp/tts-intercom'),
  ANNOUNCE_CHIME_PATH: z.string().default('/tmp/announcements'),

  FFMPEG_BIN: z.string(),

  INTERCOM_SONOS_HOSTS: z
    .string()
    .transform((str) => (str ? str.split(',').map((s) => s.trim()) : []))
    .default(''),
  INTERCOM_HASS_WEBHOOKS: z
    .string()
    .transform((str) => (str ? str.split(',').map((s) => s.trim()) : []))
    .default(''),
  HASS_ENDPOINT: z.string(),

  SERVER_ENDPOINT: z.string(),
});

dotenv.config();
export const config = configSchema.parse(process.env);
