import { useState } from 'react';

import { Box, Flex } from '@chakra-ui/react';
import { AudioRecorder } from 'components/audio/AudioRecorder';
import Onboarding from 'components/audio/AudioRecorder/components/Onboarding';
import React from 'react';

export const Chat = () => {
  //PLEASE NOTE: very meh code <3
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [conversationType, setConversationType] = useState('');
  const [voice, setVoice] = useState('');
  console.log(onboardingStep);
  if (onboardingStep <= 3) {
    return (
        <Onboarding
          onboardingStep={onboardingStep}
          setOnboardingStep={setOnboardingStep}
          conversationType={conversationType}
          setConversationType={setConversationType}
          voice={voice}
          setVoice={setVoice}
        />
    );
  }
  return (
    <>
      <Flex textAlign={'center'} pt={10} width={'full'} mb={20}>
        <Box width={{ base: 'full', lg: 'xl' }} margin={'auto'}>
          <AudioRecorder conversationType={conversationType} voice={voice} />
        </Box>
      </Flex>
    </>
  );
};

export default Chat;
