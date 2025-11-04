import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react'; // ✅ separate import fixes Render issue
import axios from 'axios';

const API_URL = 'https://atm-simulation.onrender.com/api';

function Login({ onLogin }) {
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        cardNumber,
        pin,
      });
      onLogin(response.data.token);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Login failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={8}
      maxWidth="500px"
      mx="auto"
      mt={20}
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
    >
      <VStack spacing={4} as="form" onSubmit={handleSubmit}>
        <Heading>Welcome to ATM</Heading>
        <FormControl isRequired>
          <FormLabel>Card Number</FormLabel>
          <Input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Enter your card number"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>PIN</FormLabel>
          <Input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter your PIN"
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">
          Login
        </Button>
      </VStack>
    </Box>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
