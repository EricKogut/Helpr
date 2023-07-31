import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { SpeechClient } from '@google-cloud/speech';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
const port = 8080;
const httpServer = http.createServer(app);

dotenv.config();
const apiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.VOICE_ID;

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);
app.use(cors());

// TODO: replace this with the firebaseURL
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const speechClient = new SpeechClient({
  keyFilename: './serviceAccount.json',
});

const audioStreams: {
  [key: string]: { chunks: Buffer[]; ttsInProgress: boolean };
} = {};

io.on('connection', (socket: Socket) => {
  console.log('New connection');
  console.log(socket.id);
  audioStreams[socket.id] = {
    chunks: [],
    ttsInProgress: false,
  };

  socket.on('audio-chunk', async (data: Buffer) => {
    console.log('audio chunk received');
    console.log('Pushing', data.length, 'to', socket.id);

    audioStreams[socket.id].chunks = [];
    audioStreams[socket.id].chunks.push(data);
    let completion;
    try {
      const audioBuffer = Buffer.concat(audioStreams[socket.id].chunks);
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

      if (response?.results && response.results.length > 0) {
        console.log(response.results, 'are the results');
        const transcription = response.results
          .filter(
            (result) => result.alternatives && result.alternatives.length > 0
          )
          .map(
            (result) =>
              (result.alternatives && result.alternatives[0].transcript) || ''
          )
          .join('\n');
        console.log(transcription, 'is the transcription');

        const initialSetup =
          ' As an AI therapist or doctor or whatnot, engage with me in a conversation about my feelings and thoughts surrounding [insert issue or concern]. Ask me questions to better understand my situation and provide guidance on how to cope with or overcome this challenge. Introduce yourself as Helpr, the companion. Give them steps and tips on how to curb it';
        const prompt = initialSetup + transcription;

        try {
          if (prompt == null) {
            throw new Error('Uh oh, no prompt was provided');
          }
          const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 1000,
          });
          // retrieve the completion text from response
          completion = response.data.choices[0].text;
          // ...
        } catch (error) {
          console.log(error);
        }

        try {
          const textToSpeechURL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`;
          const ttsRequestData = {
            text: completion,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.1,
              similarity_boost: 0.2,
            },
          };

          const ttsResponse = await axios.post(
            textToSpeechURL,
            ttsRequestData,
            {
              headers: {
                accept: 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
              },
              responseType: 'arraybuffer', // Tell Axios to handle the response as an ArrayBuffer
            }
          );

          if (ttsResponse && ttsResponse.data) {
            // Convert the ArrayBuffer to a Buffer
            const audioBuffer = Buffer.from(ttsResponse.data);
            console.log(audioBuffer.length, 'is the audio buffer');
            // Send the audio buffer back to the frontend via the socket
            socket.emit('audio-chunk', audioBuffer);
            // Send the transcription back to the frontend
            socket.emit('transcription', completion);
            console.log('Transcription process completed');
            socket.emit('audio-end'); // Signal that audio streaming has ended
          } else {
            console.error('Error: Invalid response format');
            socket.emit('transcription', 'Error generating text-to-speech');
          }
        } catch (error) {
          console.error('Error generating text-to-speech:', error);
          socket.emit('transcription', 'Error generating text-to-speech');
        }
      } else {
        socket.emit('transcription', 'No transcription available');
      }
    } catch (error) {
      console.error('Error handling audio:', error);
    }
  });

  socket.on('stop-streaming', () => {
    console.log(audioStreams[socket.id], 'is the stream');
    // Clear the audio data buffer for the next streaming session
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
