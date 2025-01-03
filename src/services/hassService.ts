import type { Announcement } from './announcementService.js';
import { config } from '../config.js';
import axios from 'axios';

const client = axios.create({ baseURL: config.HASS_ENDPOINT });

export const enqueueBroadcast = (announcement: Announcement): Promise<void>[] => {
  const broadcasts = config.INTERCOM_HASS_WEBHOOKS.map((webhook) =>
    broadcastAnnouncementToWebhook(announcement, webhook)
  );
  return broadcasts;
};

const broadcastAnnouncementToWebhook = async (announcement: Announcement, webhook: string): Promise<void> => {
  const url = `/api/webhook/${webhook}`;
  const payload = {
    url: announcement.url,
  };
  const response = await client.post(url, payload);
  console.log(`HASS webhook:`, { webhook, payload, status: response.status });
};
