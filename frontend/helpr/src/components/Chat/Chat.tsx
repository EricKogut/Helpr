import { Box, chakra, Flex, useColorModeValue } from '@chakra-ui/react';
import { AudioRecorder } from 'components/audio/AudioRecorder';
import React from 'react';

export const Chat = () => {
  return (
    <>
      <Flex
        textAlign={'center'}
        pt={10}
        justifyContent={'center'}
        direction={'column'}
        width={'full'}
        mb={20}
      >
        <Box width={{ base: 'full', sm: 'lg', lg: 'xl' }} margin={'auto'}>
          <chakra.h3
            fontWeight={'bold'}
            fontSize={20}
            textTransform={'uppercase'}
          >
            Helpr Health
          </chakra.h3>
          <chakra.h1
            py={5}
            fontSize={48}
            fontWeight={'bold'}
            color={useColorModeValue('gray.700', 'gray.50')}
          >
            Get Started
          </chakra.h1>
          <chakra.h2
            margin={'auto'}
            width={'70%'}
            fontWeight={'medium'}
            color={useColorModeValue('gray.500', 'gray.400')}
          >
            Click the microphone to get started{' '}
            <chakra.strong color={useColorModeValue('gray.700', 'gray.50')}>
              now
            </chakra.strong>{' '}
            with helpr health.
          </chakra.h2>
          <AudioRecorder />
        </Box>
      </Flex>
    </>
  );
};

export default Chat;
