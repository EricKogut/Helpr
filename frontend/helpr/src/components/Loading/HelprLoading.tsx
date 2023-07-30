import { Image } from '@chakra-ui/react';
import helprLogoGIF from 'assets/helpr-logo-gif.gif';

const HelprLoading = () => {
  return <Image src={helprLogoGIF.src} alt='helpr-logo' width={20} />;
};

export default HelprLoading;
