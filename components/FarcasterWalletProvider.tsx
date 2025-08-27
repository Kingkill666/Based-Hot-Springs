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

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        // Check if we're in a Farcaster environment
        const isInFarcaster = window.location.href.includes('farcaster') || 
                             window.location.href.includes('warpcast') ||
                             window.location.href.includes('miniapp') ||
                             (window as any).farcaster ||
                             (window as any).farcasterSdk ||
                             (window as any).Warpcast;

        if (!isInFarcaster) {
          console.log('🌐 Not in Farcaster environment');
          setIsLoading(false);
          return;
        }

        console.log('🎮 Farcaster environment detected');

        // Check for Farcaster wallet connection
        setTimeout(() => {
          // Check multiple ways the wallet might be available
          const walletAddress = (window as any).ethereum?.selectedAddress || 
                               (window as any).farcaster?.user?.address ||
                               (window as any).Warpcast?.user?.address ||
                               (window as any).farcasterSdk?.user?.address;
          
          if (walletAddress) {
            setAddress(walletAddress);
            setIsConnected(true);
            console.log('✅ Farcaster wallet connected:', walletAddress);
          } else {
            console.log('⚠️ No Farcaster wallet detected');
            setIsConnected(false);
            setAddress(null);
          }
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        console.error('❌ Error connecting to Farcaster wallet:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connect = () => {
    console.log('🔗 Connect wallet called');
    // In a real implementation, this would trigger wallet connection
  };

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
