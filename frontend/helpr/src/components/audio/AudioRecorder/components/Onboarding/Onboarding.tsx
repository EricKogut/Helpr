/* eslint-disable react-hooks/exhaustive-deps */
import {  useEffect } from 'react';
import Confetti from 'react-confetti';
import { Container as CustomContainer } from 'components/common/Container';

import {
  Container,
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Button,
  Divider,
  HStack,
  Stack,
} from '@chakra-ui/react';
import { BaseCard } from './BaseCard';

interface OnboardingProps {
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  conversationType: string;
  setConversationType: React.Dispatch<React.SetStateAction<string>>;
  voice: string;
  setVoice: React.Dispatch<React.SetStateAction<string>>;
}
export const Onboarding = ({
  onboardingStep,
  setOnboardingStep,
  conversationType,
  setConversationType,
  voice,
  setVoice
}:OnboardingProps) => {
 
  console.log(conversationType, "is the type")

  const nextStep = async () => {
    // Moving use to the next step
    setOnboardingStep(onboardingStep + 1);
  };
  

  useEffect(()=>{nextStep()},[conversationType, voice])
  const onboardingPrompts: string[] = [
    'Welcome to Helpr: Your Journey to Smiles and Support',
    'What do you need help with today?',
    'Who would you like to speak with?',
  ];

  const OnboardingTabs = onboardingPrompts.map((onboardingPrompt, index) => {
    const currentStep = index + 1;
    return (
      // eslint-disable-next-line react/jsx-key
      <GridItem w='100%'>
        <OnboardingTab
          key={index}
          title={'STEP ' + currentStep}
          prompt={onboardingPrompt}
          isCurrentTab={index == onboardingStep-1}
        />
      </GridItem>
    );
  });
  return (
    <>
      <Container
        bg={'white'}
        color='gray'
       
        rounded={'2xl'}
        py={5}
        my={5}
        maxW={'container.lg'}
        border={'1px'}
        marginBottom={'20px'}
      >
       
            <Heading>Almost there...</Heading>
          
        <CustomContainer>
          {onboardingStep == 1 && (
            <>
              {' '}
              <Confetti
                width={1920}
                height={1080}
                numberOfPieces={200}
                initialVelocityY={8}
              />
              <Welcome />
            </>
          )}
          {onboardingStep == 2 && <WhatAreYouHereFor setConversationType={setConversationType}/>}
          {onboardingStep == 3 && <WhoDoYouwantToTalkTo setVoice={setVoice}/>}
        </CustomContainer>
        <Grid templateRows='repeat(4)'>
          
         
          <GridItem>
            <Grid templateColumns='repeat(3, 1fr)' gap={6}>
              {OnboardingTabs.map((tab) => tab)}
            </Grid>
          </GridItem>
        </Grid>
      </Container>
      {/* <BaseIDE /> */}

      <Container
        bg={'white'}
        color='white'
        
        rounded={'2xl'}
        py={5}
        maxW={'container.lg'}
        marginBottom={'20px'}
      >
        <Grid templateColumns='repeat(2, 1fr)' gap={6}>
          <GridItem>
            <Button w='100%' onClick={nextStep}>
              skip
            </Button>
          </GridItem>
          <GridItem>
            <Button w='100%' color={'red'} onClick={nextStep}>
              continue
            </Button>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

interface OnboardingTabProps {
  title: string;
  prompt: string;
  isCurrentTab: boolean;
}

const OnboardingTab = ({ title, prompt, isCurrentTab }: OnboardingTabProps) => {
  const highlightColour = 'red';
  const textHighlight ='black'
  let lineColour = 'gray';
  let titleColour = 'gray';
  let promptColour = 'gray'

  if (isCurrentTab) {
    lineColour = highlightColour;
    titleColour = highlightColour;
    promptColour =textHighlight;
  }

  return (
    <>
      <Divider
        orientation='horizontal'
        borderColor={lineColour}
        borderWidth={'2px'}
        marginTop={'20px'}
        marginBottom={'20px'}
      />
      <Heading fontSize='lg' color={titleColour}>
        {title}
      </Heading>
      <Text color = {promptColour}>{prompt}</Text>
    </>
  );
};

const Welcome = () => {
  return (
    <Stack as={Box} textAlign={'center'} spacing={{ base: 8, md: 14 }}>
      <Heading
        fontWeight={600}
        fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
        lineHeight={'110%'}
      >
        Congratulations, <br />
        <Text as={'span'} color={'red.400'}>
          dear friend! 🎉
        </Text>
      </Heading>
      <Text color={'black.500'}>
        You&apos;ve taken a brave step towards seeking help and embarking on a
        journey to emotional well-being. 🌈 With Helpr by your side, you&apos;re
        not alone on this path. I&apos;m here to listen, support, and cheer you
        on! 🤗
      </Text>
    </Stack>
  );
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const WhatAreYouHereFor = (props) => {
  return (
    <Container
      bg={'white'}
      color='white'
      rounded={'2xl'}
      py={5}
      maxW={'container.lg'}
      marginBottom={'20px'}
    >
      <Heading
        lineHeight={1.5}
        fontSize={{ base: '1xl'}}
      >
                Select a converation type, you can change these later{' '}

      </Heading>
      <HStack>
        <BaseCard
          image={
            'https://wallpapers.com/images/featured/happy-snkhztxzr4v4ni71.jpg'
          }
          action={()=>props.setConversationType('your goal is to cheer someone up, their aim is to uplift the person\'s spirits and bring a sense of joy and positivity to their day. Whether the individual is feeling down, stressed, or going through a difficult time, the goal is to be a source of comfort and support. The person may use various strategies to achieve this, such as sharing funny jokes, heartwarming stories, or engaging in light-hearted activities together. They may also offer a listening ear and empathetic responses to acknowledge the person\'s feelings. Ultimately, the objective is to create a warm and caring atmosphere, fostering a brighter outlook and leaving the person with a smile on their face. The goal is to remind them that they are valued and cared for, and that there are moments of happiness to be found even amidst challenges.')}
          title={'Cheer Me Up'}
          memberCount={20267}
        /> 
        <BaseCard
          image={
            'https://ak.picdn.net/shutterstock/videos/1049442616/thumb/1.jpg'
          }
          action={()=>props.setConversationType(' offer assistance and support in resolving a problem or addressing a specific issue. The person may actively listen to the individual\'s concerns, gaining a clear understanding of the situation to identify the root cause of the problem. They may provide guidance, practical advice, or possible solutions based on their own knowledge and experiences. Additionally, they may collaborate with the person to explore different approaches and weigh the pros and cons of each option. The goal is to empower the individual, guiding them through the process of finding a resolution and encouraging them to take proactive steps towards overcoming the challenge. By offering their time, expertise, and encouragement, they hope to make a positive impact and help the person achieve a successful outcome.')}
          title={'Help Me Fix a Situation'}
          memberCount={10029}
        />
        <BaseCard
          image={'https://em-content.zobj.net/socialmedia/apple/118/speaking-head-in-silhouette_1f5e3.png '}
          action={()=>props.setConversationType('the intention is to provide a safe and supportive space for the individual to express themselves freely and openly. The person\'s primary focus is on being a compassionate and empathetic listener, without judgment or interruption. They aim to create an atmosphere of trust and understanding, where the other person feels comfortable sharing their thoughts, emotions, and experiences.During the conversation, the person actively engages with the individual, asking open-ended questions to encourage deeper reflection and self-expression. They may offer words of validation, acknowledging the person\'s feelings and experiences, and providing reassurance that they are heard and valued.')}
          title={'Just Listen and Talk to Me'}
          memberCount={89532}
        />
      </HStack>
    </Container>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const WhoDoYouwantToTalkTo = (props) => {
  return (
    <Container
      bg={'white'}
      color='black'
      rounded={'2xl'}
      py={5}
      maxW={'container.lg'}
      marginBottom={'20px'}
    >
      <Heading
        lineHeight={1.5}
        fontSize={{ base: '1xl'}}
      >
        Who would you like to talk to?
      </Heading>
      <HStack>
        <BaseCard
          image={
            'https://em-content.zobj.net/socialmedia/apple/81/man-gesturing-ok_1f646-200d-2642-fe0f.png'
          }
          action={()=>props.setVoice('male')}
          title={'Man'}
        /> 
        <BaseCard
          image={
            'https://em-content.zobj.net/socialmedia/apple/76/woman_1f469.png'
          }
          action={()=>props.setVoice('female')}
          title={'Female Voice'}
        />
        <BaseCard
          image={'https://em-content.zobj.net/socialmedia/apple/81/shrug_1f937.png'}
          action={()=>props.setVoice('female')}
          title={'It does not matter'}
        />
      </HStack>
    </Container>
  );
};
