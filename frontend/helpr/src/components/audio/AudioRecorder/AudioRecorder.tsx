import React, { useState, useEffect, useRef } from 'react';
import socket from './Socket/Socket';
import helprLogo from 'assets/helpr-logo.png';

import {
  chakra,
  Flex,
  useColorModeValue,
  Image,
  Button,
} from '@chakra-ui/react';
import HelprLoading from 'components/Loading/HelprLoading';

export const AudioRecorder = () => {
  const [streaming, setStreaming] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [transcription, setTranscription] = useState<string>('');
  const [responseLoading, setResponseLoading] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Array<Blob>>([]);

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
        {transcription}
        <audio ref={setAudioElement} autoPlay muted />
        <Button onClick={startStopStreaming} disabled={false}>
          {streaming ? 'Stop' : 'Talk'}
        </Button>
      </div>
      <Flex
        direction={'column'}
        textAlign={'left'}
        justifyContent={'space-between'}
      >
        <chakra.p fontWeight={'medium'} fontSize={'15px'} pb={4}>
          {'TEXT 1'}
        </chakra.p>

        <chakra.p fontWeight={'bold'} fontSize={14}>
          {'TEXT 2'}

          <chakra.span fontWeight={'medium'} color={'gray.500'}>
            {' '}
            {'TEXT 3'}
          </chakra.span>
        </chakra.p>
      </Flex>
      {responseLoading ? (
        <HelprLoading />
      ) : (
        <Image src={helprLogo.src} alt='helpr-logo' width={20} />
      )}
    </Flex>
  );
};
export default AudioRecorder;
