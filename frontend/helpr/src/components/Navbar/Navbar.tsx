import { ReactNode } from 'react';

import {
  Box,
  Flex,
  HStack,
  Link,
  Image,
  Menu,
  MenuButton, 
  Button,
} from '@chakra-ui/react';
import helprLogo from 'assets/helpr-logo.png';

const Links = [{ name: 'Chat', link: '/helpr' }];

export const Navbar = () => {
  return (
    <Box px={4} _dark={{ bg: '#16161D' }} shadow={'md'}>
      <Flex
        h={16}
        alignItems={'center'}
        justifyContent={'space-between'}
        width={'90%'}
        margin={'auto'}
      >
        <Box id='navbar-logo'>
          <Link href='/'>
            <Image
              src={helprLogo.src}
              alt='helpr-logo'
              width={8}
              paddingTop={1}
              ml={12}
            />
          </Link>
        </Box>

        <Flex alignItems={'center'}>
          <>
            {' '}
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
              ml={4}
            >
              {Links.map((link) => (
                <NavLink key={link.name}>{link.name}</NavLink>
              ))}
            </HStack>{' '}
          </>
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            ></MenuButton>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={'sm'}
    fontWeight={'300'}
    _hover={{
      bgGradient: 'linear(to-r, red.400,pink.400)',
      bgClip: 'text',
    }}
    href={'helpr'}
  >
    {children}
  </Link>
);
