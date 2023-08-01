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

type SentimentConfidences = {
  negative: { confidence: number };
  neutral: { confidence: number };
  positive: { confidence: number };
};

const calculateWeightedSentiment = (
  confidences: SentimentConfidences
): number => {
  // Apply positive and negative weights to the sentiments
  const weightedNegative = confidences.negative.confidence * 0.1; // You can adjust the weight for negative sentiment here
  const weightedNeutral = confidences.neutral.confidence * 0.2; // You can adjust the weight for neutral sentiment here
  const weightedPositive = confidences.positive.confidence * 0.7; // You can adjust the weight for positive sentiment here

  // Calculate the total weighted sentiment score
  const totalWeightedScore =
    weightedNegative + weightedNeutral + weightedPositive;

  // Map the total weighted score to a range of 0 to 100
  const sentimentScore = Math.round(totalWeightedScore * 100);

  // Ensure the sentiment score is within the valid range (0 to 100)
  return Math.min(Math.max(sentimentScore, 0), 100);
};
const audioStreams: {
  [key: string]: {
    clientData: {
      conversationType: string;
      voice: string;
      previousChat: string[];
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
    clientData: { voice: '', conversationType: '', previousChat: [''] },
    chunks: [],
    ttsInProgress: false,
  };

  socket.on('client-connected', (clientData) => {
    console.log('Initial data received from client:', clientData);
    // Store the initial data in the audioStreams object using socket.id as the key
    audioStreams[socket.id] = {
      clientData: { ...clientData, previousChat: [''] },
      chunks: [],
      ttsInProgress: false,
    };
  });

  socket.on('audio-chunk', async (data) => {
    console.log('audio chunk received');
    console.log('Pushing', data.length, 'to', socket.id);

    audioStreams[socket.id].chunks = [];
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

        audioStreams[socket.id].clientData.previousChat.push(
          transcript.slice(1)
        );

        const classificationScore = await classifyMentalHealthInputs([
          transcript,
        ]);

        console.log(classificationScore, 'is the score');

        const sentimentScore: number = calculateWeightedSentiment(
          classificationScore[0] as SentimentConfidences
        );

        console.log(sentimentScore, 'is the score');
        const initialSetup =
          'You are a interactive AI caled "Helpr" And you help users solve their issues. Introduce youself if need be. Mention the sentiment score only if they ask about it';
        const userSetup = audioStreams[socket.id].clientData.conversationType;
        const previousChats =
          audioStreams[socket.id].clientData.previousChat.join(' ');
        const prompt =
          initialSetup +
          ' the current senitment score is' +
          sentimentScore.toString() +
          ' ' +
          userSetup +
          transcript +
          'Your response may not have to do with anything I do here. Here is what we talked about before: ' +
          'here is what you previously talked about, continue the conversation from this point. ' +
          "Don't repeat what you said before but mention things I have brought up. " +
          'If I ask a question about you, remember to use this info. ' +
          'If I forget something, mention something from here. : ' +
          previousChats;

        console.log(prompt, 'is the prompt');

        try {
          const completion = await generateChatResponse(prompt);
          console.log(completion);
          try {
            const audioBuffer = await textToSpeech(
              completion,
              audioStreams[socket.id].clientData.voice
            );
            console.log(audioBuffer.length, 'is the audio buffer');
            socket.emit('audio-chunk', audioBuffer);
            socket.emit('transcription', completion);
            socket.emit('classificationScore', sentimentScore);

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
