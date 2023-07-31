import {
  Avatar,
  Box,
  chakra,
  Flex,
  SimpleGrid,
  useColorModeValue,
  Text,
  Stack,
} from '@chakra-ui/react';

import helprLogo from 'assets/helpr-logo.png';

interface ChatCardProps {
  content: string;
  index: number;
}

const ChatCard = (props: ChatCardProps) => {
  const { content } = props;
  return (
    <Flex
      boxShadow={'lg'}
      width={'full'}
      rounded={'xl'}
      p={10}
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Flex
        direction={'column'}
        textAlign={'left'}
        justifyContent={'space-between'}
      >
        <chakra.p
          fontFamily={'Inter'}
          fontWeight={'medium'}
          fontSize={'15px'}
          pb={4}
        >
          {content}
        </chakra.p>
        <chakra.p fontWeight={'bold'} fontSize={14}>
          Helpr
          <chakra.span
            fontFamily={'Inter'}
            fontWeight={'medium'}
            color={'gray.500'}
          >
            {' '}
            - your friendly companion
          </chakra.span>
        </chakra.p>
      </Flex>
      <Avatar
        src={helprLogo.src}
        height={'80px'}
        border={'inset'}
        width={'80px'}
        alignSelf={'center'}
        m={{ base: '0 0 35px 0', md: '0 0 0 50px' }}
      />
    </Flex>
  );
};

interface Props {
  allMessages: string[];
}

export const Messages = ({ allMessages }: Props) => {
  return (
    <Flex
      textAlign={'center'}
      pt={10}
      justifyContent={'center'}
      direction={'column'}
      width={'full'}
      overflow={'hidden'}
    >
      <SimpleGrid columns={{ base: 1 }} mt={1} mb={1} mx={'auto'}>
        <Box maxHeight='100px' overflowY='auto'>
          {' '}
          {/* Wrap the ChatCard elements in a scrollable container */}
          {allMessages.map((message, index) => (
            <ChatCard key={index} content={message} index={index} />
          ))}
        </Box>
        <Stack
          bg={useColorModeValue('gray.50', 'gray.800')}
          py={16}
          px={8}
          spacing={{ base: 8, md: 10 }}
          align={'center'}
          direction={'column'}
        >
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            textAlign={'center'}
            maxW={'3xl'}
          >
            {allMessages[allMessages.length - 1]}
          </Text>
          <Box textAlign={'center'}>
            <Avatar src={helprLogo.src} mb={2} />

            <Text fontWeight={600}>Helpr</Text>
            <Text
              fontSize={'sm'}
              color={useColorModeValue('gray.400', 'gray.400')}
            >
              Your Friendly Companion
            </Text>
          </Box>
        </Stack>
      </SimpleGrid>
    </Flex>
  );
};
