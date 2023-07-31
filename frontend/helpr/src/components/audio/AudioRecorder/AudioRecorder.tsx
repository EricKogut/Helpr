import React, { useState, useEffect, useRef } from 'react';
import socket from './components/Socket/Socket';
import helprLogo from 'assets/helpr-logo.png';

import { Flex, useColorModeValue, Image, Button } from '@chakra-ui/react';
import HelprLoading from 'components/Loading/HelprLoading';

interface Props {
  voice: string;
  conversationType?: string;
}
// Also plz don't judge this too hard LOL, I was going to cleean it up
export const AudioRecorder = ({voice, conversationType}:Props) => {
  console.log(voice, "is the voice", conversationType, "is the conversationType")
  const [streaming, setStreaming] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [transcription, setTranscription] = useState<string>('');
  const [responseLoading, setResponseLoading] = useState<boolean>(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioStreamingComplete, setIsAudioStreamingComplete] =
    useState(false);

  const [initialData, setInitialData] = useState({voice:voice, conversationType:conversationType});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Create a ref for the audio element

  useEffect(() => {
    // Send initialData to the backend as soon as the client is connected
    socket.emit('client-connected', initialData);

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Set up the AudioContext when the component mounts
    const audioContext = new window.AudioContext();
    audioContextRef.current = audioContext;

    // Clean up the AudioContext when the component unmounts
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((error) => {
          console.error('Error closing AudioContext:', error);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (audioStream && audioRef.current) {
      audioRef.current.srcObject = audioStream;
    }
  }, [audioStream]);

  useEffect(() => {
    // Listen for audio chunks from the backend
    socket.on('audio-chunk', (audioChunk) => {
      setAudioChunks([]);

      // Handle the audio chunk here
      console.log('Received audio chunk:', audioChunk);
      setAudioChunks((prevAudioChunks) => [...prevAudioChunks, audioChunk]);
    });

    // Listen for the "audio-end" event to signal the end of audio streaming
    socket.on('audio-end', () => {
      setIsAudioStreamingComplete(true);
    });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off('audio-chunk');
      socket.off('audio-end');
    };
  }, []);

  useEffect(() => {
    console.log('SHOULD i CALL IT ');
    if (isAudioStreamingComplete) {
      playAudioChunks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioStreamingComplete, audioChunks]);

  const stopAudio = () => {
    console.log(audioSourceNodeRef.current);
    if (audioSourceNodeRef.current && isPlaying) {
      setIsPlaying(false);
      audioSourceNodeRef.current.stop(); // Stop the audio playback
    }
  };
  const playAudioChunks = async () => {
    console.log('this is called');
    const audioContext = audioContextRef.current;

    if (!audioContext) {
      console.log('Cannot play audio: invalid state or already playing.');
      return;
    }

    // Concatenate all received audio chunks into a single Blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Read the Blob data into an ArrayBuffer
    const audioData = await audioBlob.arrayBuffer();

    // Decode the ArrayBuffer into an AudioBuffer
    try {
      const audioBuffer = await audioContext.decodeAudioData(audioData);

      // Stop the current audio source node if it exists
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.stop();
      }

      // Start playback
      const audioSource = audioContext.createBufferSource();
      audioSourceNodeRef.current = audioSource; // Update the audioSourceNodeRef with the new source node
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start(); // Start the audio playback
      setIsPlaying(true); // Update the isPlaying state
      audioSource.onended = () => {
        setIsPlaying(false); // Reset isPlaying state when audio ends
      };
    } catch (error) {
      console.error('Error decoding audio data:', error);
    }
  };

  const startStopStreaming = () => {
    setStreaming((prevStreaming) => !prevStreaming);
    // Put your start and stop streaming logic here
    if (!streaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
  };

  const startStreaming = async () => {
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
    setResponseLoading(true);
  };

  useEffect(() => {
    socket.on('transcription', (transcription) => {
      setTranscription(transcription);
      setResponseLoading(false);
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
    <>
      {transcription}

      <Flex
        boxShadow={'lg'}
        maxW={'640px'}
        direction={{ base: 'column-reverse', md: 'row' }}
        width={'full'}
        rounded={'xl'}
        p={10}
        justifyContent={'space-between'}
        position={'relative'}
        bg={useColorModeValue('white', 'gray.800')}
      >
        <div>
          <audio ref={setAudioElement} autoPlay muted />

          <Button onClick={startStopStreaming} disabled={false}>
            {streaming ? 'Stop' : 'Talk'}
          </Button>
        </div>
        <div>
          <button
            onClick={playAudioChunks}
            disabled={!isAudioStreamingComplete}
          >
            Play Audio
          </button>
          <button onClick={stopAudio} disabled={!isPlaying}>
            Stop Audio
          </button>
        </div>
        <Flex
          direction={'column'}
          textAlign={'left'}
          justifyContent={'space-between'}
        ></Flex>
        {responseLoading ? (
          <HelprLoading />
        ) : (
          <Image src={helprLogo.src} alt='helpr-logo' width={20} />
        )}
      </Flex>
    </>
  );
};
export default AudioRecorder;
