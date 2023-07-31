// elevenLabs.js
import axios from 'axios';

const apiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.VOICE_ID;

export const textToSpeech = async (text: string) => {
  const textToSpeechURL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`;
  const ttsRequestData = {
    text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.1,
      similarity_boost: 0.2,
    },
  };

  try {
    const ttsResponse = await axios.post(textToSpeechURL, ttsRequestData, {
      headers: {
        accept: 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer', // Tell Axios to handle the response as an ArrayBuffer
    });

    return ttsResponse.data;
  } catch (error) {
    console.error('Error generating text-to-speech:', error);
    throw new Error('Error generating text-to-speech');
  }
};
