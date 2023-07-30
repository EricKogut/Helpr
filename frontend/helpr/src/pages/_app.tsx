// pages/_app.js
import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { Navbar } from 'components/Navbar/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Navbar />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
