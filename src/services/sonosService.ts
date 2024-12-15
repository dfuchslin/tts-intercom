import { SonosDevice } from '@svrooij/sonos';
import type { Announcement } from './announcementService.js';
import { config } from '../config.js';

export const enqueueBroadcast = (announcement: Announcement): Promise<void>[] => {
  const broadcasts = config.INTERCOM_HOSTNAMES_SONOS.map((hostname) =>
    broadcastAnnouncementToHost(announcement, hostname)
  );
  return broadcasts;
};

const broadcastAnnouncementToHost = async (announcement: Announcement, hostname: string): Promise<void> => {
  // https://sonos-ts.svrooij.io/sonos-device/notifications-and-tts.html
  const sonos = new SonosDevice(hostname);

  return new Promise<void>(async (resolve, reject) => {
    console.log(`Playing notification to ${hostname} for url=${announcement.url}`);
    sonos
      .PlayNotification({
        trackUri: announcement.url,
        onlyWhenPlaying: false, // make sure that it only plays when you're listening to music. So it won't play when you're sleeping.
        timeout: 10, // If the events don't work (to see when it stops playing) or if you turned on a stream, it will revert back after this amount of seconds.
        volume: 50, // Set the volume for the notification (and revert back afterwards)
        delayMs: 700, // Pause between commands in ms, (when sonos fails to play sort notification sounds).
      })
      .catch((error) => {
        console.log(`Problem announcing to Sonos device ${hostname}!`, { error });
        reject();
      })
      .then((played: any) => {
        console.log('Played notification %o', played);
        resolve();
      });
  });
};
