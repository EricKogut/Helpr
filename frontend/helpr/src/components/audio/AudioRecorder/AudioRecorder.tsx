import React, { useState, useEffect, useRef } from 'react';
import socket from './Socket/Socket';

export const AudioRecorder = () => {
  const [streaming, setStreaming] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startStreaming = async () => {
    console.log('starting stream');
    setStreaming(true);

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioStream(audioStream);

      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        console.log('data is available');
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopStreaming = () => {
    console.log('stopping streaming');
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setAudioStream(null);
    setStreaming(false);
    socket.emit('stop-streaming');
  };

  useEffect(() => {
    socket.on('transcription', (transcription) => {
      console.log('Transcription:', transcription);
    });

    return () => {
      socket.off('transcription');
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (audioStream && audioElement) {
      audioElement.srcObject = audioStream;
    }
  }, [audioStream, audioElement]);

  useEffect(() => {
    const sendChunksInterval = setInterval(() => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        console.log('emitting');
        socket.emit('audio-chunk', audioBlob);
        audioChunksRef.current = [];
      }
    }, 2000);

    return () => {
      clearInterval(sendChunksInterval);
    };
  }, []);

  return (
    <div>
      <audio ref={setAudioElement} autoPlay muted />
      <button onClick={startStreaming} disabled={streaming}>
        Start Streaming
      </button>
      <button onClick={stopStreaming} disabled={!streaming}>
        Stop Streaming
      </button>
    </div>
  );
};

export default AudioRecorder;
