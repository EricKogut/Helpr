import {
  Card,
  useColorModeValue,
  Text,
  Stack,
  CardFooter,
  Button,
  SimpleGrid,
  CardBody,
  Avatar,
  Container,
  HStack,
  Badge,
  Link,
  
} from '@chakra-ui/react';

interface Props {
  action: () => void;
  title: string;
  image?: string;
  memberCount?: number;
}

export const BaseCard = ({
  action,
  memberCount,
  title,
  image,
}: Props) => {
  return (
    <SimpleGrid
      spacing={10}
      templateColumns='repeat(auto-fill, minmax(300px, 1fr))'
    >
      <Card
        maxW='sm'
        w={'full'}
        h={'full'}
        bg={useColorModeValue('white', 'gray.800')}
        rounded={'md'}
        pos={'relative'}
        zIndex={1}
      >
        <CardBody>
          <Container
            rounded={'2xl'}
            h='200px'
            backgroundImage={
              image || 'https://source.unsplash.com/600x900/?gradient'
            }
            backgroundSize={'cover'}
            backgroundPosition={'center'}
          >
            <Stack direction='row' py={3}>
              <Badge>{status}</Badge>
            </Stack>
            <Stack my={'6rem'} spacing={0}>
              <Text color='blackAlpha.800' as='b'>
                {title}
              </Text>
              <HStack>
                <Avatar size='xs' src='https://bit.ly/broken-link' />
                {memberCount && (
                  <Text color='whiteAlpha.700' fontSize='xs'>
                    {memberCount} people have tried this
                  </Text>
                )}
              </HStack>
            </Stack>
          </Container>
        </CardBody>
        <CardFooter>
          <Button width={'full'} onClick={action}>
            <Link >
              <>
                Select
              </>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </SimpleGrid>
  );
};
