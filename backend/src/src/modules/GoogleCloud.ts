// googleCloud.js
import { SpeechClient } from '@google-cloud/speech';

const speechClient = new SpeechClient({
  keyFilename: './serviceAccount.json',
});

//TODO: fix this any
export const transcribeAudio = async (audioChunks: Buffer[]) => {
  const audioBuffer = Buffer.concat(audioChunks);
  const [response] = await speechClient.recognize({
    config: {
      encoding: 0,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    },
    audio: {
      content: audioBuffer,
    },
  });

  return response?.results || [];
};
