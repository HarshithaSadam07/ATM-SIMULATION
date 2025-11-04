import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  HStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react'; // ✅ fixed separate import
import axios from 'axios';

// 🔹 Change API URL to your deployed backend (not localhost)
const API_URL = 'https://atm-simulation.onrender.com/api';

function Dashboard({ token, onLogout }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');

  const {
    isOpen: isDepositOpen,
    onOpen: onDepositOpen,
    onClose: onDepositClose,
  } = useDisclosure();
  const {
    isOpen: isWithdrawOpen,
    onOpen: onWithdrawOpen,
    onClose: onWithdrawClose,
  } = useDisclosure();

  const toast = useToast();

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/account/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to fetch balance',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/account/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to fetch transactions',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [token]);

  const handleDeposit = async () => {
    try {
      await axios.post(
        `${API_URL}/account/deposit`,
        { amount: Number.parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBalance();
      fetchTransactions();
      onDepositClose();
      setAmount('');
      toast({
        title: 'Success',
        description: 'Money deposited successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Deposit failed',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post(
        `${API_URL}/account/withdraw`,
        { amount: Number.parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBalance();
      fetchTransactions();
      onWithdrawClose();
      setAmount('');
      toast({
        title: 'Success',
        description: 'Money withdrawn successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Withdrawal failed',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={8} maxWidth="800px" mx="auto" mt={10}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">ATM Dashboard</Heading>
          <Button onClick={onLogout} colorScheme="red">
            Logout
          </Button>
        </HStack>

        <Box p={6} borderWidth={1} borderRadius={8} boxShadow="md">
          <Heading size="md" mb={4}>
            Current Balance
          </Heading>
          <Text fontSize="2xl" fontWeight="bold" color="green.500">
            ₹{balance.toFixed(2)}
          </Text>
        </Box>

        <HStack spacing={4}>
          <Button onClick={onDepositOpen} colorScheme="green" flex={1}>
            Deposit
          </Button>
          <Button onClick={onWithdrawOpen} colorScheme="blue" flex={1}>
            Withdraw
          </Button>
        </HStack>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Transaction History
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((transaction) => (
                <Tr key={transaction._id}>
                  <Td>{new Date(transaction.date).toLocaleString()}</Td>
                  <Td textTransform="capitalize">{transaction.type}</Td>
                  <Td
                    isNumeric
                    color={
                      transaction.type === 'deposit' ? 'green.500' : 'red.500'
                    }
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}₹
                    {transaction.amount.toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositOpen} onClose={onDepositClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deposit Money</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </FormControl>
            <Button
              mt={4}
              colorScheme="green"
              onClick={handleDeposit}
              width="full"
            >
              Deposit
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Withdraw Money</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={handleWithdraw}
              width="full"
            >
              Withdraw
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

Dashboard.propTypes = {
  token: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Dashboard;
