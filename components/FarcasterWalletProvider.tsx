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
        
        console.log('🔍 Checking for wallet connection...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🌐 Window objects:', {
          ethereum: !!(window as any).ethereum,
          farcaster: !!(window as any).farcaster,
          farcasterSdk: !!(window as any).farcasterSdk,
          Warpcast: !!(window as any).Warpcast,
        });

        // Check if we're in a Farcaster environment (more permissive)
        const isInFarcaster = window.location.href.includes('farcaster') || 
                             window.location.href.includes('warpcast') ||
                             window.location.href.includes('miniapp') ||
                             window.location.href.includes('vercel.app') || // Allow testing on deployment
                             (window as any).farcaster ||
                             (window as any).farcasterSdk ||
                             (window as any).Warpcast ||
                             (window as any).ethereum;

        console.log('🎮 Farcaster environment detected:', isInFarcaster);

        // Check for wallet connection with multiple attempts
        const checkWallet = () => {
          // Check multiple ways the wallet might be available
          const walletAddress = (window as any).ethereum?.selectedAddress || 
                               (window as any).farcaster?.user?.address ||
                               (window as any).Warpcast?.user?.address ||
                               (window as any).farcasterSdk?.user?.address ||
                               (window as any).ethereum?.accounts?.[0] ||
                               (window as any).ethereum?.address;
          
          console.log('🔍 Wallet address found:', walletAddress);
          
          if (walletAddress) {
            setAddress(walletAddress);
            setIsConnected(true);
            console.log('✅ Farcaster wallet connected:', walletAddress);
            setIsLoading(false);
          } else {
            console.log('⚠️ No Farcaster wallet detected yet, retrying...');
            // Retry after a delay
            setTimeout(checkWallet, 2000);
          }
        };

        // Start checking for wallet
        checkWallet();

        // Also listen for wallet connection events
        if ((window as any).ethereum) {
          (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log('🔄 Accounts changed:', accounts);
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
              setIsLoading(false);
            } else {
              setAddress(null);
              setIsConnected(false);
            }
          });
        }

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
