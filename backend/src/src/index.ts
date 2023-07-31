// app.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { transcribeAudio } from './modules/GoogleCloud';
import { generateChatResponse } from './modules/ChatGPT';
import { textToSpeech } from './modules/ElevenLabs';
import { classifyMentalHealthInputs } from './modules/Cohere';

const app = express();
const port = 8080;
const httpServer = http.createServer(app);
dotenv.config();

app.use(cors());

const audioStreams: {
  [key: string]: {
    clientData: {
      conversationType: string;
      voice: string;
      previousChat: string;
    };
    chunks: Buffer[];
    ttsInProgress: boolean;
  };
} = {};
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New connection');
  console.log(socket.id);
  audioStreams[socket.id] = {
    clientData: {voice:"", conversationType:"", previousChat:""},
    chunks: [],
    ttsInProgress: false,
  };

  socket.on('client-connected', (clientData) => {
    console.log('Initial data received from client:', clientData);
    // Store the initial data in the audioStreams object using socket.id as the key
    audioStreams[socket.id] = {
      clientData,
      chunks: [],
      ttsInProgress: false,
    };
  });

  socket.on('audio-chunk', async (data) => {
    console.log('audio chunk received');
    console.log('Pushing', data.length, 'to', socket.id);

    audioStreams[socket.id].chunks.push(data);
    try {
      const transcription = await transcribeAudio(
        audioStreams[socket.id].chunks
      );

      if (transcription.length > 0) {
        console.log(transcription, 'are the results');
        const transcript = transcription
          .filter(
            (result) => result.alternatives && result.alternatives.length > 0
          )
          .map(
            (result) =>
              (result.alternatives && result.alternatives[0].transcript) || ''
          )
          .join('\n');
        const classificationScore = await classifyMentalHealthInputs([
          transcript,
        ]);

        console.log(classificationScore);
        const initialSetup = "You are a interactive AI caled helper And you help users solve their issues. Introduce yourself if need be"
        const userSetup = audioStreams[socket.id].clientData.conversationType
        const prompt = initialSetup + userSetup + transcript; 

        try {
          const completion = await generateChatResponse(prompt);

          try {
            const audioBuffer = await textToSpeech('yo mr. w', audioStreams[socket.id].clientData.voice);
            console.log(audioBuffer.length, 'is the audio buffer');
            socket.emit('audio-chunk', audioBuffer);
            socket.emit('transcription', completion);
            console.log('Transcription process completed');
            socket.emit('audio-end');
          } catch (error) {
            console.error('Error generating text-to-speech:', error);
            socket.emit('transcription', 'Error generating text-to-speech');
          }
        } catch (error) {
          console.log(error);
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
