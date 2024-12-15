import dotenv from 'dotenv';
import { z } from 'zod';

const configSchema = z.object({
  SERVICE_PORT: z.coerce.number().default(3000),

  TEMP_DIR: z.string().default('/tmp/tts-intercom'),
  ANNOUNCE_CHIME_PATH: z.string().default('/tmp/announcements'),

  INTERCOM_HOSTNAMES_SONOS: z
    .string()
    .transform((str) => (str ? str.split(',').map((s) => s.trim()) : []))
    .default(''),
  INTERCOM_HOSTNAMES_ESP: z
    .string()
    .transform((str) => (str ? str.split(',').map((s) => s.trim()) : []))
    .default(''),
});

dotenv.config();
export const config = configSchema.parse(process.env);
