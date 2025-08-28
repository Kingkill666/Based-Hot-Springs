"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FarcasterWalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => void;
}

const FarcasterWalletContext = createContext<FarcasterWalletContextType>({
  address: null,
  isConnected: false,
  isLoading: true,
  error: null,
  connect: () => {},
});

export const FarcasterWalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Connecting to Farcaster wallet...');
      
      // Import and initialize the Farcaster SDK
      const { sdk } = await import('@farcaster/frame-sdk');
      
      // Ensure SDK is ready
      await sdk.actions.ready();
      
      // Get wallet provider
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        throw new Error('Wallet provider not available');
      }
      
      // Request wallet connection
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        console.log('✅ Farcaster wallet connected:', accounts[0]);
      } else {
        throw new Error('No accounts returned from wallet');
      }
    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Farcaster SDK and check wallet connection
    const initializeSDK = async () => {
      try {
        console.log('🔧 Initializing Farcaster SDK...');
        
        // Import and initialize the Farcaster SDK
        const { sdk } = await import('@farcaster/frame-sdk');
        
        // Wait for SDK to be ready
        console.log('⏳ Waiting for SDK to be ready...');
        await sdk.actions.ready();
        console.log('✅ SDK ready');
        
        // Verify wallet availability
        const provider = await sdk.wallet.getEthereumProvider();
        if (!provider) {
          throw new Error('Wallet provider not available');
        }
        
        console.log('✅ Wallet provider available');
        
        // Check if already connected
        const accounts = await provider.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          console.log('✅ Already connected to Farcaster wallet:', accounts[0]);
        } else {
          console.log('ℹ️ No existing wallet connection');
        }
        
      } catch (err) {
        console.error('❌ SDK initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Farcaster SDK');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  return (
    <FarcasterWalletContext.Provider value={{
      address,
      isConnected,
      isLoading,
      error,
      connect,
    }}>
      {children}
    </FarcasterWalletContext.Provider>
  );
};

export const useFarcasterWallet = () => {
  const context = useContext(FarcasterWalletContext);
  if (!context) {
    throw new Error('useFarcasterWallet must be used within a FarcasterWalletProvider');
  }
  return context;
};
