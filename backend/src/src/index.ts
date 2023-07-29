import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { SpeechClient } from '@google-cloud/speech';
import cors from 'cors';

const app = express();
const port = 8080;
const httpServer = http.createServer(app);

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

const audioStreams: { [key: string]: Buffer[] } = {};

io.on('connection', (socket: Socket) => {
  console.log('New connection');
  console.log(socket.id);
  audioStreams[socket.id] = [];

  socket.on('audio-chunk', async (data: Buffer) => {
    console.log('audio chunk received');

    audioStreams[socket.id].push(data);

    try {
      const audioBuffer = Buffer.concat(audioStreams[socket.id]);
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
        const transcription = response.results
          .map(
            (result) =>
              (result.alternatives && result.alternatives[0].transcript) || ''
          )
          .join('\n');

        // Send the transcription back to the frontend
        socket.emit('transcription', transcription);
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
    audioStreams[socket.id] = [];
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
