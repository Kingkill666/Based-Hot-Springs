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
      // Use the Farcaster SDK wallet provider
      const sdk = (window as any).farcasterSdk;
      if (!sdk?.wallet) {
        throw new Error('Farcaster SDK wallet not available');
      }

      const provider = sdk.wallet.getEthereumProvider();
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
    // Check if already connected
    const checkConnection = async () => {
      try {
        const sdk = (window as any).farcasterSdk;
        if (sdk?.wallet) {
          const provider = sdk.wallet.getEthereumProvider();
          const accounts = await provider.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            console.log('✅ Already connected to Farcaster wallet:', accounts[0]);
          }
        }
      } catch (err) {
        console.log('No existing wallet connection');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
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
