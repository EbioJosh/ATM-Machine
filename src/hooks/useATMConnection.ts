import { useState, useEffect, useCallback } from 'react';

export interface User {
  uid: string;
  cardNumber: string;
  name: string;
  accountType: string;
  balance: number;
  transactions: Array<{
    date: string;
    type: string;
    amount: number;
    balance: number;
  }>;
}

interface UseATMConnectionReturn {
  isConnected: boolean;
  isScanning: boolean;
  currentUser: User | null;
  error: string | null;
  scanCard: () => Promise<void>;
  demoLogin: () => Promise<void>;
  printReceipt: () => Promise<void>;
  logout: () => void;
  connect: () => void;
  disconnect: () => void;
}

// Configuration for backend connection
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'; // Default to true for demo

export const useATMConnection = (): UseATMConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Mock data loader
  const loadMockUsers = useCallback(async (): Promise<User[]> => {
    const response = await fetch('/src/data/mockUsers.json');
    const data = await response.json();
    return data.users;
  }, []);

  // WebSocket connection for real-time RFID scanning
  const connect = useCallback(() => {
    if (USE_MOCK_DATA) {
      setIsConnected(true);
      setError(null);
      console.log('🎭 Running in MOCK MODE - Using demo data');
      return;
    }

    try {
      const websocket = new WebSocket(`ws://${BACKEND_URL.replace('http://', '')}/rfid`);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('✅ Connected to ATM backend');
      };

      websocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'card_detected') {
            console.log('🔍 Card detected:', data.uid);
            await fetchUserData(data.uid);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      websocket.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
        setError('Connection error. Switching to demo mode.');
        setIsConnected(false);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        console.log('🔌 Disconnected from ATM backend');
      };

      setWs(websocket);
    } catch (err) {
      console.error('Failed to connect:', err);
      setError('Failed to connect to backend. Using demo mode.');
      setIsConnected(true); // Fallback to mock mode
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsConnected(false);
    setCurrentUser(null);
  }, [ws]);

  // Fetch user data by UID (from backend or mock)
  const fetchUserData = useCallback(async (uid: string) => {
    try {
      if (USE_MOCK_DATA) {
        const users = await loadMockUsers();
        const user = users.find(u => u.uid === uid);
        
        if (user) {
          setCurrentUser(user);
          setError(null);
        } else {
          setError('Card not recognized');
          setCurrentUser(null);
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/api/user/${uid}`);
        
        if (!response.ok) {
          throw new Error('User not found');
        }
        
        const user = await response.json();
        setCurrentUser(user);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user data');
      setCurrentUser(null);
    }
  }, [loadMockUsers]);

  // Simulate or trigger card scan
  const scanCard = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simulate scanning delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Pick a random mock user
        const users = await loadMockUsers();
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        await fetchUserData(randomUser.uid);
      } else {
        // Trigger backend RFID scan
        const response = await fetch(`${BACKEND_URL}/api/rfid/scan`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error('Scan failed');
        }
        
        const data = await response.json();
        await fetchUserData(data.uid);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Card scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [fetchUserData, loadMockUsers]);

  // Direct demo login (loads first user instantly)
  const demoLogin = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Load first mock user directly
      const users = await loadMockUsers();
      const firstUser = users[0];
      
      if (firstUser) {
        await fetchUserData(firstUser.uid);
      } else {
        setError('No demo users available');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed');
    } finally {
      setIsScanning(false);
    }
  }, [fetchUserData, loadMockUsers]);

  // Print receipt
  const printReceipt = useCallback(async () => {
    if (!currentUser) {
      setError('No active session');
      return;
    }

    try {
      if (USE_MOCK_DATA) {
        console.log('🖨️ [MOCK] Printing receipt for:', currentUser.name);
        console.log(`Account: ${currentUser.accountType}`);
        console.log(`Balance: ₱${currentUser.balance.toFixed(2)}`);
        
        // Simulate printing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        const response = await fetch(`${BACKEND_URL}/api/print`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: currentUser.uid,
            name: currentUser.name,
            accountType: currentUser.accountType,
            balance: currentUser.balance,
            cardNumber: currentUser.cardNumber
          })
        });

        if (!response.ok) {
          throw new Error('Print failed');
        }
      }
      
      // Show success feedback (you can add toast here)
      console.log('✅ Receipt printed successfully');
    } catch (err) {
      console.error('Print error:', err);
      setError('Failed to print receipt');
    }
  }, [currentUser]);

  // Logout current user
  const logout = useCallback(() => {
    setCurrentUser(null);
    setError(null);
    console.log('👋 User logged out');
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    isScanning,
    currentUser,
    error,
    scanCard,
    demoLogin,
    printReceipt,
    logout,
    connect,
    disconnect
  };
};
